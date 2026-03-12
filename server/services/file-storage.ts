/**
 * File storage service using Supabase Storage.
 * Falls back to local base64 data URLs when Supabase is not configured.
 */
import { supabaseServer } from "../supabase";
import { randomBytes } from "crypto";

const BUCKET_NAME = "uploads";

export function isFileStorageConfigured(): boolean {
  return !!supabaseServer;
}

/**
 * Ensure the uploads bucket exists (idempotent)
 */
async function ensureBucket(): Promise<void> {
  if (!supabaseServer) return;
  const { error } = await supabaseServer.storage.createBucket(BUCKET_NAME, {
    public: true,
    fileSizeLimit: 10 * 1024 * 1024, // 10 MB
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
  });
  // Ignore "already exists" error
  if (error && !error.message.includes("already exists")) {
    console.error("Failed to create storage bucket:", error.message);
  }
}

// Run on module load
ensureBucket().catch(() => {});

/**
 * Upload a file buffer to Supabase Storage
 */
export async function uploadFile(opts: {
  buffer: Buffer;
  filename: string;
  contentType: string;
  folder: string; // e.g. "profile-pictures", "verification-docs", "car-images"
}): Promise<string> {
  const ext = opts.filename.split(".").pop() || "bin";
  const uniqueName = `${opts.folder}/${randomBytes(16).toString("hex")}.${ext}`;

  if (!supabaseServer) {
    // Fallback: return a data URL (works for dev, not for production)
    const base64 = opts.buffer.toString("base64");
    return `data:${opts.contentType};base64,${base64}`;
  }

  const { error } = await supabaseServer.storage
    .from(BUCKET_NAME)
    .upload(uniqueName, opts.buffer, {
      contentType: opts.contentType,
      upsert: false,
    });

  if (error) {
    throw new Error(`File upload failed: ${error.message}`);
  }

  const { data } = supabaseServer.storage.from(BUCKET_NAME).getPublicUrl(uniqueName);
  return data.publicUrl;
}

/**
 * Delete a file from Supabase Storage by its public URL
 */
export async function deleteFile(publicUrl: string): Promise<void> {
  if (!supabaseServer) return;

  // Extract the path from the URL
  const bucketPath = publicUrl.split(`/storage/v1/object/public/${BUCKET_NAME}/`)[1];
  if (!bucketPath) return;

  const { error } = await supabaseServer.storage.from(BUCKET_NAME).remove([bucketPath]);
  if (error) {
    console.error("Failed to delete file:", error.message);
  }
}
