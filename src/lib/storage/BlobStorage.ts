// REVIEWED

import { del, head, put } from "@vercel/blob";

export interface FileInfoBlob {
  name?: string;
  url: string;
  size: number;
}

export class StorageBlob {
  /**
   * Upload a file to Vercel Blob storage
   */
  static async fileUpload(
    file: Buffer,
    name: string,
    contentType: string = "application/pdf",
  ): Promise<FileInfoBlob> {
    try {
      const { url } = await put(name, file, {
        access: "public",
        contentType,
      });

      return {
        name,
        url,
        size: file.length,
      };
    } catch (error) {
      console.error("Failed to upload file to Vercel Blob:", error);
      throw new Error("Failed to upload file");
    }
  }

  /**
   * Download a file from Vercel Blob storage
   */
  static async fileDownload(url: string): Promise<Buffer | null> {
    try {
      const response = await fetch(url);

      if (!response.ok) return null;

      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      console.error("Failed to download file from Vercel Blob:", error);
      return null;
    }
  }

  /**
   * Delete a file from Vercel Blob storage
   */
  static async deleteFile(url: string): Promise<boolean> {
    try {
      await del(url);
      return true;
    } catch (error) {
      console.error("Failed to delete file from Vercel Blob:", error);
      return false;
    }
  }

  /**
   * Get file information from Vercel Blob storage
   */
  static async getFileInfo(url: string): Promise<FileInfoBlob | null> {
    try {
      const response = await head(url);

      return {
        url,
        size: response.size,
      };
    } catch (error) {
      console.error("Failed to get file info from Vercel Blob:", error);
      return null;
    }
  }

  /**
   * Generate a unique file name for a certificate
   */
  static generateCertificateFileName(certificateId: string): string {
    return `certificates/${certificateId}.pdf`;
  }

  /**
   * Generate a unique file name for a key pair
   */
  static generateKeyPairFileName(
    issuerId: number,
    keyType: "public" | "private",
  ): string {
    return `keys/${issuerId}/${keyType}.pem`;
  }
}
