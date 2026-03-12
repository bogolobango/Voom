/**
 * WebSocket server for real-time messaging.
 * Attaches to the existing HTTP server — no extra port needed.
 *
 * Auth: The client sends { type: "auth", userId: <id> } where the
 * userId must match the session-authenticated user. We parse the
 * session cookie on the initial HTTP upgrade to verify identity.
 */
import { WebSocketServer, WebSocket } from "ws";
import type { Server as HttpServer } from "http";
import type { IncomingMessage } from "http";
import { parse as parseCookie } from "cookie";
import { storage } from "./storage";

// Map of userId -> Set of active WebSocket connections (one user can have multiple tabs)
const clients = new Map<number, Set<WebSocket>>();

let wss: WebSocketServer | null = null;

/**
 * Try to extract the session user ID from the upgrade request cookie.
 * Returns the userId or null if not authenticated.
 */
async function getSessionUserId(req: IncomingMessage): Promise<number | null> {
  try {
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) return null;

    const cookies = parseCookie(cookieHeader);
    const rawSid = cookies["voom.sid"] || cookies["connect.sid"];
    if (!rawSid) return null;

    // connect.sid format is "s:<sessionId>.<signature>"
    const match = rawSid.match(/^s:([^.]+)\./);
    if (!match) return null;

    const sessionId = match[1];
    // Look up session in the store
    return new Promise((resolve) => {
      (storage.sessionStore as any).get(sessionId, (err: any, session: any) => {
        if (err || !session) return resolve(null);
        const passportUser = session?.passport?.user;
        resolve(typeof passportUser === "number" ? passportUser : null);
      });
    });
  } catch {
    return null;
  }
}

/**
 * Initialize the WebSocket server on the given HTTP server.
 * Messages from clients are expected as JSON: { type, ... }
 * The server broadcasts to relevant users.
 */
export function setupWebSocket(server: HttpServer): void {
  // Skip WebSocket setup in serverless environments (Vercel, Lambda)
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return;
  }

  wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", async (ws: WebSocket, req: IncomingMessage) => {
    let userId: number | null = null;

    // Try to pre-authenticate from session cookie
    const sessionUserId = await getSessionUserId(req);

    ws.on("message", (data) => {
      try {
        const msg = JSON.parse(data.toString());

        // Client must identify itself: { type: "auth", userId: 123 }
        // We verify the claimed userId matches the session
        if (msg.type === "auth" && typeof msg.userId === "number") {
          if (sessionUserId === null) {
            ws.send(JSON.stringify({ type: "auth_error", message: "Not authenticated" }));
            ws.close();
            return;
          }
          if (msg.userId !== sessionUserId) {
            ws.send(JSON.stringify({ type: "auth_error", message: "User ID mismatch" }));
            ws.close();
            return;
          }
          userId = sessionUserId;
          if (!clients.has(userId)) {
            clients.set(userId, new Set());
          }
          clients.get(userId)!.add(ws);
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
