/**
 * WebSocket server for real-time messaging.
 * Attaches to the existing HTTP server — no extra port needed.
 */
import { WebSocketServer, WebSocket } from "ws";
import type { Server as HttpServer } from "http";
import type { IncomingMessage } from "http";

// Map of userId -> Set of active WebSocket connections (one user can have multiple tabs)
const clients = new Map<number, Set<WebSocket>>();

let wss: WebSocketServer | null = null;

/**
 * Initialize the WebSocket server on the given HTTP server.
 * Messages from clients are expected as JSON: { type, ... }
 * The server broadcasts to relevant users.
 */
export function setupWebSocket(server: HttpServer): void {
  wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
    let userId: number | null = null;

    ws.on("message", (data) => {
      try {
        const msg = JSON.parse(data.toString());

        // Client must identify itself first: { type: "auth", userId: 123 }
        if (msg.type === "auth" && typeof msg.userId === "number") {
          const uid: number = msg.userId;
          userId = uid;
          if (!clients.has(uid)) {
            clients.set(uid, new Set());
          }
          clients.get(uid)!.add(ws);
          ws.send(JSON.stringify({ type: "auth_ok" }));
          return;
        }

        // Ping/pong for keepalive
        if (msg.type === "ping") {
          ws.send(JSON.stringify({ type: "pong" }));
          return;
        }
      } catch {
        // Ignore malformed messages
      }
    });

    ws.on("close", () => {
      if (userId !== null) {
        const userConns = clients.get(userId);
        if (userConns) {
          userConns.delete(ws);
          if (userConns.size === 0) {
            clients.delete(userId);
          }
        }
      }
    });

    ws.on("error", () => {
      // Prevent crashes from individual socket errors
    });
  });
}

/**
 * Broadcast a new message event to a specific user.
 * Called from routes when a message is created.
 */
export function notifyNewMessage(receiverId: number, message: any): void {
  const userConns = clients.get(receiverId);
  if (!userConns) return;

  const payload = JSON.stringify({
    type: "new_message",
    message,
  });

  const conns = Array.from(userConns);
  for (const ws of conns) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  }
}

/**
 * Broadcast a typing indicator to a specific user.
 */
export function notifyTyping(receiverId: number, senderId: number): void {
  const userConns = clients.get(receiverId);
  if (!userConns) return;

  const payload = JSON.stringify({
    type: "typing",
    senderId,
  });

  const conns = Array.from(userConns);
  for (const ws of conns) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  }
}

/**
 * Get the count of currently connected users (for admin/debug).
 */
export function getConnectedUserCount(): number {
  return clients.size;
}
