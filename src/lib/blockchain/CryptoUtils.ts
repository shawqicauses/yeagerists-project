// REVIEWED
import crypto from "crypto";
import fs from "fs/promises";
import path from "path";

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
   * Save key pair to files
   */
  static async saveKeyPair(keyPair: KeyPair, issuerId: string): Promise<void> {
    const keysDirectory = path.join(process.cwd(), "data", "keys", issuerId);
    await fs.mkdir(keysDirectory, { recursive: true });

    await fs.writeFile(
      path.join(keysDirectory, "public.pem"),
      keyPair.publicKey,
    );

    await fs.writeFile(
      path.join(keysDirectory, "private.pem"),
      keyPair.privateKey,
    );
  }

  /**
   * Load key pair from files
   */
  static async getKeyPair(issuerId: string): Promise<KeyPair | null> {
    try {
      const keysDirectory = path.join(process.cwd(), "data", "keys", issuerId);

      const publicKey = await fs.readFile(
        path.join(keysDirectory, "public.pem"),
        "utf-8",
      );

      const privateKey = await fs.readFile(
        path.join(keysDirectory, "private.pem"),
        "utf-8",
      );

      return { publicKey, privateKey };
    } catch (error) {
      console.error(`Failed to load keys for issuer ${issuerId}:`, error);
      return null;
    }
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
