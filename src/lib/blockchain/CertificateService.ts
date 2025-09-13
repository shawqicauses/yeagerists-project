// REVIEWED - 01

import { Blockchain, Certificate } from "@/payload-types";

import { payload } from "../payload";
import { StorageBlob } from "../storage/BlobStorage";

import { Block, CertificateData } from "./Block";
// eslint-disable-next-line import/no-cycle
import { Blockchain as BlockchainClass } from "./Blockchain";
import { CryptoUtils, KeyPair } from "./CryptoUtils";

export interface CertificateMetadata {
  title: string;
  description: string;
  dateIssued: string;
  dateExpiry?: string;
  issuerName: string;
  recipientName: string;
  certificateId: string;
  publicKey: string;
  signature: string;
  timestamp: number;
}

export interface CertificateSigned {
  certificateId: string;
  filePath: string;
  metadata: CertificateMetadata;
  blockchainHash: string;
  blockIndex: number;
}

export interface VerifyCertificate {
  isValid: boolean;
  certificate?: CertificateSigned;
  verificationDetails: {
    fileExists: boolean;
    blockchainVerified: boolean;
    signatureValid: boolean;
    contentValid: boolean;
    primaryHashValid: boolean;
    metadata?: CertificateMetadata;
  };
}

export class CertificateService {
  private blockchain: BlockchainClass;

  constructor(blockchain: BlockchainClass) {
    this.blockchain = blockchain;
  }

  /**
   * Initialize certificate service
   */
  async initialize(): Promise<void> {
    await this.blockchain.getFromStorage(CertificateService);
  }

  /**
   * Get blockchain information
   */
  getBlockchainInfo(): {
    length: number;
    isValid: boolean;
    latestBlock: Block;
  } {
    return this.blockchain.getChainInfo();
  }

  /**
   * Save key pair to PayLoad CMS
   */
  private static async saveKeyPair(
    keyPair: KeyPair,
    issuerId: number,
  ): Promise<void> {
    try {
      // Check if key pair exists
      const existing = await payload.find({
        collection: "key-pairs",
        where: {
          issuer: {
            equals: issuerId,
          },
        },
      });

      if (existing.docs.length > 0) {
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
      } else {
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
   * Get key pair ID for issuer
   */
  private static async getKeyPairId(issuerId: number): Promise<number | null> {
    try {
      const result = await payload.find({
        collection: "key-pairs",
        limit: 1,
        where: {
          issuer: {
            equals: issuerId,
          },
        },
      });

      return result.docs.length > 0 ? result.docs[0].id : null;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to get key pair ID from PayLoad:", error);
      return null;
    }
  }

  /**
   * Get key pair for issuer
   */
  private static async getKeyPair(issuerId: number): Promise<KeyPair | null> {
    try {
      const result = await payload.find({
        collection: "key-pairs",
        limit: 1,
        where: {
          issuer: {
            equals: issuerId,
          },
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
      console.error("Failed to get key pair from PayLoad:", error);
      return null;
    }
  }

  /**
   * Save certificate to PayLoad CMS
   */
  private static async saveCertificate(
    certificate: Omit<Certificate, "id" | "createdAt" | "updatedAt">,
    bufferFile: Buffer,
  ): Promise<void> {
    try {
      // Upload file to Vercel Blob
      const fileName = StorageBlob.generateCertificateFileName(
        certificate.certificateId,
      );

      const fileInfo = await StorageBlob.fileUpload(bufferFile, fileName);

      await payload.create({
        collection: "certificates",
        data: {
          ...certificate,
          fileName: fileInfo.name || certificate.certificateId,
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
   * Get certificate file buffer
   */
  private static async getCertificate(
    certificateId: number,
  ): Promise<Buffer | null> {
    try {
      const result = await payload.find({
        collection: "certificates",
        limit: 1,
        where: {
          certificateId: {
            equals: certificateId.toString(),
          },
        },
      });

      if (result.docs.length === 0) return null;

      const certificate = result.docs[0];
      return await StorageBlob.fileDownload(certificate.fileURL);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to get certificate from PayLoad:", error);
      return null;
    }
  }

  /**
   * Get certificate metadata
   */
  private static async getCertificateMetadata(
    certificateId: number,
  ): Promise<Certificate | null> {
    try {
      const result = await payload.find({
        limit: 1,
        collection: "certificates",
        where: {
          certificateId: {
            equals: certificateId.toString(),
          },
        },
      });

      return result.docs.length > 0 ? result.docs[0] : null;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to get certificate metadata from PayLoad:", error);
      return null;
    }
  }

  /**
   * Get public key from certificate's key pair
   */
  private static async getCertificatePublicKey(
    certificateId: number,
  ): Promise<string | null> {
    try {
      const certificate =
        await CertificateService.getCertificateMetadata(certificateId);

      if (!certificate) return null;

      const keyPairResult = await payload.findByID({
        collection: "key-pairs",
        id:
          typeof certificate.keyPair === "number"
            ? certificate.keyPair
            : certificate.keyPair.id,
      });

      return keyPairResult ? keyPairResult.publicKey : null;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to get certificate public key:", error);
      return null;
    }
  }

  /**
   * Get all certificates for a user
   */
  private static async getUserCertificatesInternal(
    userAccreditId: number,
  ): Promise<Certificate[]> {
    try {
      const result = await payload.find({
        collection: "certificates",
        where: {
          recipient: {
            equals: userAccreditId,
          },
        },
      });

      return result.docs;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to get user certificates from PayLoad:", error);
      return [];
    }
  }

  /**
   * Get all certificates issued by an issuer
   */
  private static async getIssuerCertificatesInternal(
    issuerId: number,
  ): Promise<Certificate[]> {
    try {
      const result = await payload.find({
        collection: "certificates",
        where: {
          issuer: {
            equals: issuerId,
          },
        },
      });

      return result.docs;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to get issuer certificates from PayLoad:", error);
      return [];
    }
  }

  /**
   * Save blockchain to PayLoad CMS
   */
  static async saveBlockchain(
    blockchainData: Omit<Blockchain, "id" | "createdAt" | "updatedAt">,
  ): Promise<void> {
    try {
      // Check if blockchain exists
      const existing = await payload.find({
        collection: "blockchain",
        where: {
          chainId: {
            equals: "main",
          },
        },
      });

      if (existing.docs.length > 0) {
        // Update existing blockchain
        await payload.update({
          collection: "blockchain",
          id: existing.docs[0].id,
          data: blockchainData,
        });
      } else {
        // Create new blockchain
        await payload.create({
          collection: "blockchain",
          data: blockchainData,
        });
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to save blockchain to PayLoad:", error);
      throw error;
    }
  }

  /**
   * Get blockchain from PayLoad CMS
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

      return result.docs.length > 0 ? result.docs[0] : null;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to get blockchain from PayLoad:", error);
      return null;
    }
  }

  /**
   * Issue a new certificate by signing a PDF
   */
  async issueCertificate(
    issuerId: number,
    userAccreditId: number,
    bufferPDF: Buffer,
    metadata: Partial<CertificateMetadata>,
  ): Promise<CertificateSigned> {
    // Generate or load issuer's key pair
    let keyPair = await CertificateService.getKeyPair(issuerId);

    if (!keyPair) {
      keyPair = CryptoUtils.generateKeyPair();
      await CertificateService.saveKeyPair(keyPair, issuerId);
    }

    // Get key pair ID for relationship
    const keyPairId = await CertificateService.getKeyPairId(issuerId);
    if (!keyPairId) throw new Error("Failed to get key pair ID after saving");

    // Generate certificate ID and hash
    const certificateId = CryptoUtils.generateCertificateId();
    const certificateHash = CryptoUtils.generateBufferHash(bufferPDF);
    const contentHash = CryptoUtils.generateContentHash(bufferPDF);

    // Create certificate signature
    const signature = CryptoUtils.createCertificateSignature(
      certificateHash,
      keyPair.privateKey,
      keyPair.publicKey,
    );

    const certificateMetadata: CertificateMetadata = {
      title: metadata.title || "Certificate",
      description: metadata.description || "",
      dateIssued: new Date().toISOString(),
      dateExpiry: metadata.dateExpiry,
      issuerName: metadata.issuerName || "Unknown Issuer",
      recipientName: metadata.recipientName || "Unknown Recipient",
      certificateId,
      publicKey: keyPair.publicKey,
      signature: signature.signature,
      timestamp: signature.timestamp,
    };

    // Create certificate object for PayLoad
    const certificate: Omit<Certificate, "id" | "createdAt" | "updatedAt"> = {
      certificateId,
      issuer: issuerId,
      recipient: userAccreditId,
      certificateHash,
      contentHash,
      keyPair: keyPairId,
      signature: signature.signature,
      fileURL: "", // will be set after blob upload
      metadata: certificateMetadata as unknown as Record<string, unknown>,
      blockchainHash: "", // will be set after adding to blockchain
      blockIndex: 0, // will be set after adding to blockchain
    };

    // Save signed PDF to PayLoad CMS
    await CertificateService.saveCertificate(certificate, bufferPDF);

    // Create certificate data for blockchain
    const certificateData: CertificateData = {
      issuerId: issuerId.toString(),
      userAccreditId: userAccreditId.toString(),
      certificateHash,
      publicKey: keyPair.publicKey,
      timestamp: Date.now(),
      metadata: certificateMetadata as unknown as Record<string, unknown>,
    };

    // Insert to blockchain
    const block = this.blockchain.insertBlock(certificateData);
    // Save blockchain to storage
    await this.blockchain.saveToStorage(CertificateService);

    return {
      certificateId,
      filePath: `blob://certificates/${certificateId}.pdf`, // Will be updated with actual URL after save
      metadata: certificateMetadata,
      blockchainHash: block.hash,
      blockIndex: block.index,
    };
  }

  /**
   * Verify a certificate
   */
  async verifyCertificate(certificateId: number): Promise<VerifyCertificate> {
    const verificationDetails = {
      fileExists: false,
      blockchainVerified: false,
      signatureValid: false,
      contentValid: false,
      primaryHashValid: false,
      metadata: undefined as CertificateMetadata | undefined,
    };

    try {
      // Check if certificate exists in PayLoad CMS
      const certificateMetadata =
        await CertificateService.getCertificateMetadata(certificateId);

      const fileExists = certificateMetadata !== null;

      verificationDetails.fileExists = fileExists;

      if (!fileExists) return { isValid: false, verificationDetails };

      // Get certificate history to find certificate
      const entireBlocks = this.blockchain.chain;
      const certificateBlock = entireBlocks.find(
        (block) => block.data.metadata?.certificateId === certificateId,
      );

      if (!certificateBlock) return { isValid: false, verificationDetails };

      verificationDetails.blockchainVerified = true;
      verificationDetails.metadata =
        certificateMetadata?.metadata as unknown as CertificateMetadata;

      // Verify signature
      const metadata =
        certificateMetadata?.metadata as unknown as CertificateMetadata;
      const bufferFile = await CertificateService.getCertificate(certificateId);

      if (!bufferFile) return { isValid: false, verificationDetails };

      // Use content hash for verification (more reliable after upload/download)
      const currentContentHash = CryptoUtils.generateContentHash(bufferFile);
      const contentValid =
        currentContentHash === certificateMetadata.contentHash;

      // Also verify original hash for backward compatibility
      const currentHash = CryptoUtils.generateBufferHash(bufferFile);
      const primaryHashValid =
        currentHash === certificateMetadata.certificateHash;

      // Get public key from key pair relationship
      const publicKey =
        await CertificateService.getCertificatePublicKey(certificateId);

      if (!publicKey) return { isValid: false, verificationDetails };

      // Verify signature using original hash (as stored in blockchain)
      const signatureValid = CryptoUtils.verifyCertificateSignature(
        certificateMetadata.certificateHash, // Use original hash for signature verification
        metadata.signature,
        publicKey,
        metadata.timestamp,
      );

      verificationDetails.signatureValid = signatureValid;

      const certificate: CertificateSigned = {
        certificateId: String(certificateId),
        filePath:
          certificateMetadata?.fileURL ||
          `blob://certificates/${certificateId}.pdf`,
        metadata,
        blockchainHash: certificateBlock.hash,
        blockIndex: certificateBlock.index,
      };

      return {
        isValid: fileExists && signatureValid && contentValid,
        certificate,
        verificationDetails: {
          ...verificationDetails,
          contentValid,
          primaryHashValid,
        },
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Certificate verification failed:", error);
      return { isValid: false, verificationDetails };
    }
  }

  /**
   * Get all certificates for an accredited user
   */
  static async getUserCertificates(
    userAccreditId: number,
  ): Promise<CertificateSigned[]> {
    const certificatesStored =
      await CertificateService.getUserCertificatesInternal(userAccreditId);

    return certificatesStored.map((certificate) => ({
      certificateId: certificate.certificateId,
      filePath: certificate.fileURL, // Actual Vercel Blob URL
      metadata: certificate.metadata as unknown as CertificateMetadata,
      blockchainHash: certificate.blockchainHash,
      blockIndex: certificate.blockIndex,
    }));
  }

  /**
   * Get all certificates issued by an issuer
   */
  static async getIssuerCertificates(
    issuerId: number,
  ): Promise<CertificateSigned[]> {
    const certificatesStored =
      await CertificateService.getIssuerCertificatesInternal(issuerId);

    return certificatesStored.map((certificate) => ({
      certificateId: certificate.certificateId,
      filePath: certificate.fileURL, // Actual Vercel Blob URL
      metadata: certificate.metadata as unknown as CertificateMetadata,
      blockchainHash: certificate.blockchainHash,
      blockIndex: certificate.blockIndex,
    }));
  }

  /**
   * Download certificate file
   */
  static async certificateDownload(
    certificateId: string,
  ): Promise<Buffer | null> {
    try {
      return await CertificateService.getCertificate(
        parseInt(certificateId, 10),
      );
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to download certificate:", error);
      return null;
    }
  }
}
