// REVIEWED
import crypto from "crypto";
import fs from "fs/promises";

export interface KeyPair {
  publicKey: string;
  privateKey: string;
}

export interface CertificateSignature {
  signature: string;
  publicKey: string;
  timestamp: number;
}

export class CryptoUtils {
  private static readonly KEY_SIZE = 2048;

  private static readonly HASH_ALGORITHM = "sha256";

  /**
   * Generate a new RSA key pair
   */
  static generateKeyPair(): KeyPair {
    const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
      modulusLength: this.KEY_SIZE,
      publicKeyEncoding: { type: "spki", format: "pem" },
      privateKeyEncoding: { type: "pkcs8", format: "pem" },
    });

    return {
      publicKey: publicKey.toString(),
      privateKey: privateKey.toString(),
    };
  }

  /**
   * Sign data with a private key
   */
  static signData(data: string, privateKey: string): string {
    const sign = crypto.createSign(this.HASH_ALGORITHM);
    sign.update(data);
    sign.end();

    return sign.sign(privateKey, "base64");
  }

  /**
   * Verify signature with a public key
   */
  static verifySignature(
    data: string,
    signature: string,
    publicKey: string,
  ): boolean {
    try {
      const verify = crypto.createVerify(this.HASH_ALGORITHM);
      verify.update(data);
      verify.end();

      return verify.verify(publicKey, signature, "base64");
    } catch (error) {
      console.error("Signature verification failed:", error);
      return false;
    }
  }

  /**
   * Generate hash of data
   */
  static generateHash(data: string): string {
    return crypto.createHash("sha256").update(data).digest("hex");
  }

  /**
   * Generate hash of file content
   */
  static async generateFileHash(filePath: string): Promise<string> {
    const bufferFile = await fs.readFile(filePath);
    return crypto.createHash("sha256").update(bufferFile).digest("hex");
  }

  /**
   * Generate hash of buffer content
   */
  static generateBufferHash(buffer: Buffer): string {
    return crypto.createHash("sha256").update(buffer).digest("hex");
  }

  /**
   * Generate hash of PDF content only (excluding meta data)
   * This is more reliable for verification after upload/download
   */
  static generateContentHash(buffer: Buffer): string {
    try {
      // For now, we'll use a simple approach that's more stable
      // In production, we might want to use a PDF parsing library
      // to extract only content streams

      // Remove common meta data that changes during upload/download
      const contentBuffer = this.removePDFMetadata(buffer);
      return crypto.createHash("sha256").update(contentBuffer).digest("hex");
    } catch {
      // Fallback to full buffer hash if processing fails
      return this.generateBufferHash(buffer);
    }
  }

  /**
   * Remove PDF meta data that can change during upload/download
   * This is a simplified approach - in production, we should use a proper PDF library
   */
  private static removePDFMetadata(buffer: Buffer): Buffer {
    // This is a simplified approach
    // In production, we should use a PDF parsing library like `pdf-parse`
    // to extract only content streams and ignore meta data

    // For now, we'll return original buffer
    // TODO: Implement proper PDF meta data removal
    return buffer;
  }

  /**
   * Create a certificate signature
   */
  static createCertificateSignature(
    certificateHash: string,
    privateKey: string,
    publicKey: string,
  ): CertificateSignature {
    const timestamp = Date.now();
    const dataToSign = `${certificateHash}:${timestamp}`;
    const signature = this.signData(dataToSign, privateKey);

    return {
      signature,
      publicKey,
      timestamp,
    };
  }

  /**
   * Verify a certificate signature
   */
  static verifyCertificateSignature(
    certificateHash: string,
    signature: string,
    publicKey: string,
    timestamp: number,
  ): boolean {
    const dataToVerify = `${certificateHash}:${timestamp}`;
    return this.verifySignature(dataToVerify, signature, publicKey);
  }

  /**
   * Save key pair to PayLoad CMS
   */
  static async saveKeyPair(keyPair: KeyPair, issuerId: number): Promise<void> {
    // eslint-disable-next-line import/no-cycle
    const { StoragePayload } = await import("./StoragePayload");
    await StoragePayload.saveKeyPair(keyPair, issuerId);
  }

  /**
   * Load key pair from PayLoad CMS
   */
  static async getKeyPair(issuerId: number): Promise<KeyPair | null> {
    const { StoragePayload } = await import("./StoragePayload");
    return StoragePayload.getKeyPair(issuerId);
  }

  /**
   * Generate a unique certificate ID
   */
  static generateCertificateId(): string {
    return crypto.randomUUID();
  }

  /**
   * Create a secure random string
   */
  static generateSecureRandom(length: number = 32): string {
    return crypto.randomBytes(length).toString("hex");
  }
}
