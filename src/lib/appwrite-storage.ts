import { Client, Storage, ID } from "node-appwrite";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

// Initialize Appwrite client for server-side
const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1")
  .setProject(process.env.APPWRITE_PROJECT_ID || "")
  .setKey(process.env.APPWRITE_API_KEY || ""); // Server API Key

const storage = new Storage(client);

const BUCKET_ID = process.env.APPWRITE_BUCKET_ID || "";

/**
 * Upload file buffer to Appwrite Storage
 * Uses temporary file approach since node-appwrite needs file path
 * @returns File ID and download URL
 */
export async function uploadToAppwrite(
  fileBuffer: Buffer,
  filename: string
): Promise<{ fileId: string; url: string }> {
  const fileId = ID.unique();
  
  // Create temporary file (node-appwrite needs file path)
  const tempDir = os.tmpdir();
  const tempFilePath = path.join(tempDir, `appwrite-${Date.now()}-${filename}`);
  
  try {
    // Write buffer to temp file
    await fs.writeFile(tempFilePath, fileBuffer);
    
    // Read as Blob/File for Appwrite
    const fileData = await fs.readFile(tempFilePath);
    const blob = new Blob([fileData], { type: "text/csv" });
    const file = new File([blob], filename, { type: "text/csv" });
    
    // Upload to Appwrite
    const result = await storage.createFile(
      BUCKET_ID,
      fileId,
      file
    );

    // Generate download URL
    const url = getAppwriteDownloadUrl(result.$id);

    return {
      fileId: result.$id,
      url,
    };
  } finally {
    // Cleanup temp file
    try {
      await fs.unlink(tempFilePath);
    } catch {
      // Ignore cleanup errors
    }
  }
}

/**
 * Get public view URL for a file
 */
export function getAppwriteFileUrl(fileId: string): string {
  const endpoint = process.env.APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1";
  const projectId = process.env.APPWRITE_PROJECT_ID || "";
  return `${endpoint}/storage/buckets/${BUCKET_ID}/files/${fileId}/view?project=${projectId}`;
}

/**
 * Get download URL for a file (forces download instead of view)
 */
export function getAppwriteDownloadUrl(fileId: string): string {
  const endpoint = process.env.APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1";
  const projectId = process.env.APPWRITE_PROJECT_ID || "";
  return `${endpoint}/storage/buckets/${BUCKET_ID}/files/${fileId}/download?project=${projectId}`;
}

/**
 * Delete file from Appwrite Storage
 */
export async function deleteFromAppwrite(fileId: string): Promise<void> {
  await storage.deleteFile(BUCKET_ID, fileId);
}

/**
 * Get file info/metadata
 */
export async function getFileInfo(fileId: string) {
  return await storage.getFile(BUCKET_ID, fileId);
}
