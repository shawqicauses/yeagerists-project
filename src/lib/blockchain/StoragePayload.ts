// REVIEWED

import { Blockchain, Certificate } from "@/payload-types";

import { payload } from "../payload";

// eslint-disable-next-line import/no-cycle
import { KeyPair } from "./CryptoUtils";

export class StoragePayload {
  /**
   * Save key pair to Payload CMS
   */
  static async saveKeyPair(keyPair: KeyPair, issuerId: number): Promise<void> {
    try {
      // Check if key pair  exists
      const existing = await payload.find({
        collection: "key-pairs",
        where: {
          issuer: {
            equals: issuerId,
          },
        },
      });

      if (existing.docs.length > 0)
        // Update existing key pair
        await payload.update({
          collection: "key-pairs",
          id: existing.docs[0].id,
          data: {
            algorithm: "RSA",
            publicKey: keyPair.publicKey,
            privateKey: keyPair.privateKey,
            keySize: 2048,
            isActive: true,
          },
        });
      else {
        // Create new key pair
        await payload.create({
          collection: "key-pairs",
          data: {
            issuer: issuerId,
            algorithm: "RSA",
            publicKey: keyPair.publicKey,
            privateKey: keyPair.privateKey,
            keySize: 2048,
            isActive: true,
          },
        });
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to save key pair to PayLoad:", error);
      throw error;
    }
  }

  /**
   * Get key pair ID from issuer ID
   */
  static async getKeyPairId(issuerId: number): Promise<number | null> {
    try {
      const result = await payload.find({
        collection: "key-pairs",
        limit: 1,
        where: {
          issuer: { equals: issuerId },
          isActive: { equals: true },
        },
      });

      if (result.docs.length === 0) return null;

      return result.docs[0].id;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to get key pair ID from PayLoad:", error);
      return null;
    }
  }

  /**
   * Load key pair from PayLoad CMS
   */
  static async getKeyPair(issuerId: number): Promise<KeyPair | null> {
    try {
      const result = await payload.find({
        collection: "key-pairs",
        limit: 1,
        where: {
          issuer: { equals: issuerId },
          isActive: { equals: true },
        },
      });

      if (result.docs.length === 0) return null;

      const keyPair = result.docs[0];

      return {
        publicKey: keyPair.publicKey,
        privateKey: keyPair.privateKey,
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to load key pair from PayLoad:", error);
      return null;
    }
  }

  /**
   * Save certificate to PayLoad CMS
   */
  static async saveCertificate(
    certificate: Certificate,
    bufferFile: Buffer,
  ): Promise<void> {
    try {
      // Upload file to Vercel Blob
      const { StorageBlob } = await import("../storage/BlobStorage");

      const fileName = StorageBlob.generateCertificateFileName(
        certificate.certificateId,
      );
      const fileInfo = await StorageBlob.uploadFile(bufferFile, fileName);

      //   uploadedAt
      await payload.create({
        collection: "certificates",
        data: {
          ...certificate,
          fileName: fileInfo.filename,
          fileURL: fileInfo.url,
          fileSize: fileInfo.size,
        },
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to save certificate to PayLoad:", error);
      throw error;
    }
  }

  /**
   * Load certificate from PayLoad CMS
   */
  static async getCertificate(certificateId: number): Promise<Buffer | null> {
    try {
      const result = await payload.find({
        collection: "certificates",
        limit: 1,
        where: {
          certificateId: {
            equals: certificateId,
          },
        },
      });

      if (result.docs.length === 0) return null;

      const certificate = result.docs[0];

      // Download file from Vercel Blob
      const { StorageBlob } = await import("../storage/BlobStorage");
      return await StorageBlob.downloadFile(certificate.fileURL);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to load certificate from PayLoad:", error);
      return null;
    }
  }

  /**
   * Get public key from certificate's key pair
   */
  static async getCertificatePublicKey(
    certificateId: number,
  ): Promise<string | null> {
    try {
      // First get  certificate
      const certificationResult = await payload.find({
        collection: "certificates",
        limit: 1,
        where: {
          certificateId: {
            equals: certificateId,
          },
        },
      });

      if (certificationResult.docs.length === 0) return null;

      const certificate = certificationResult.docs[0];

      // Then get key pair
      const keyPairResult = await payload.findByID({
        collection: "key-pairs",
        id:
          typeof certificate.keyPair === "number"
            ? certificate.keyPair
            : certificate.keyPair.id,
      });

      if (!keyPairResult) return null;

      const keyPair = keyPairResult;
      return keyPair.publicKey;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(
        "Failed to get certificate public key from PayLoad:",
        error,
      );

      return null;
    }
  }

  /**
   * Get certificate meta data from PayLoad CMS
   */
  static async getCertificateMetadata(
    certificateId: number,
  ): Promise<Certificate | null> {
    try {
      const result = await payload.find({
        collection: "certificates",
        limit: 1,
        where: {
          certificateId: {
            equals: certificateId,
          },
        },
      });

      if (result.docs.length === 0) return null;

      return result.docs[0];
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to load certificate metadata from PayLoad:", error);
      return null;
    }
  }

  /**
   * Get user certificates from PayLoad CMS
   */
  static async getUserCertificates(
    userAccreditId: number,
  ): Promise<Certificate[]> {
    try {
      const result = await payload.find({
        collection: "certificates",
        sort: "-createdAt",
        where: {
          recipient: {
            equals: userAccreditId,
          },
        },
      });

      return result.docs;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to load user certificates from PayLoad:", error);
      return [];
    }
  }

  /**
   * Get issuer certificates from PayLoad CMS
   */
  static async getIssuerCertificates(issuerId: number): Promise<Certificate[]> {
    try {
      const result = await payload.find({
        collection: "certificates",
        sort: "-createdAt",
        where: {
          issuer: {
            equals: issuerId,
          },
        },
      });

      return result.docs;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to load issuer certificates from PayLoad:", error);
      return [];
    }
  }

  /**
   * Save blockchain to PayLoad CMS
   */
  static async saveBlockchain(blockchain: Blockchain): Promise<void> {
    try {
      // Check if blockchain  exists
      const existing = await payload.find({
        collection: "blockchain",
        where: {
          chainId: {
            equals: "main",
          },
        },
      });

      if (existing.docs.length > 0)
        // Update existing blockchain
        await payload.update({
          collection: "blockchain",
          id: existing.docs[0].id,
          data: blockchain,
        });
      // Create new blockchain
      else
        await payload.create({
          collection: "blockchain",
          data: blockchain,
        });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to save blockchain to PayLoad:", error);
      throw error;
    }
  }

  /**
   * Load blockchain from PayLoad CMS
   */
  static async getBlockchain(): Promise<Blockchain | null> {
    try {
      const result = await payload.find({
        collection: "blockchain",
        limit: 1,
        where: {
          chainId: {
            equals: "main",
          },
        },
      });

      if (result.docs.length === 0) return null;

      return result.docs[0];
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to load blockchain from PayLoad:", error);
      return null;
    }
  }

  /**
   * Update certificate verification status
   */
  static async updateCertificateVerification(
    certificateId: number,
    isVerified: boolean,
  ): Promise<void> {
    try {
      const result = await payload.find({
        collection: "certificates",
        limit: 1,
        where: {
          certificateId: {
            equals: certificateId,
          },
        },
      });

      if (result.docs.length > 0)
        await payload.update({
          collection: "certificates",
          id: result.docs[0].id,
          data: {
            isVerified,
            verificationCount: (result.docs[0].verificationCount || 0) + 1,
          },
        });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to update certificate verification:", error);
      throw error;
    }
  }
}
