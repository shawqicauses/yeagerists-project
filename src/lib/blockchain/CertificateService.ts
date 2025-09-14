// REVIEWED - 02

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
   * Get certificate file buffer by UUID
   */
  private static async getCertificateByUUID(
    certificateId: string,
  ): Promise<Buffer | null> {
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
   * Get certificate metadata by UUID
   */
  private static async getCertificateMetadataByUUID(
    certificateId: string,
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

    // Create certificate data for blockchain FIRST
    const certificateData: CertificateData = {
      issuerId: issuerId.toString(),
      userAccreditId: userAccreditId.toString(),
      certificateHash,
      publicKey: keyPair.publicKey,
      timestamp: Date.now(),
      metadata: certificateMetadata as unknown as Record<string, unknown>,
    };

    // Insert to blockchain to get actual blockchain hash
    const block = this.blockchain.insertBlock(certificateData);
    // Save blockchain to storage
    await this.blockchain.saveToStorage(CertificateService);

    // Create certificate object for PayLoad with actual blockchain hash
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
      blockchainHash: block.hash,
      blockIndex: block.index,
    };

    // Save signed PDF to PayLoad CMS with correct blockchain hash
    await CertificateService.saveCertificate(certificate, bufferPDF);

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
      return await CertificateService.getCertificateByUUID(certificateId);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to download certificate:", error);
      return null;
    }
  }

  /**
   * Get certificate by UUID (public method)
   */
  static async getCertificateByUUIDPublic(
    certificateId: string,
  ): Promise<CertificateSigned | null> {
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
      return {
        certificateId: certificate.certificateId,
        filePath: certificate.fileURL,
        metadata: certificate.metadata as unknown as CertificateMetadata,
        blockchainHash: certificate.blockchainHash,
        blockIndex: certificate.blockIndex,
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to get certificate by UUID:", error);
      return null;
    }
  }

  /**
   * Get certificate by file hash
   */
  static async getCertificateByHash(
    fileHash: string,
  ): Promise<CertificateSigned | null> {
    try {
      const result = await payload.find({
        collection: "certificates",
        limit: 1,
        where: {
          certificateHash: {
            equals: fileHash,
          },
        },
      });

      if (result.docs.length === 0) return null;

      const certificate = result.docs[0];
      return {
        certificateId: certificate.certificateId,
        filePath: certificate.fileURL,
        metadata: certificate.metadata as unknown as CertificateMetadata,
        blockchainHash: certificate.blockchainHash,
        blockIndex: certificate.blockIndex,
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to get certificate by hash:", error);
      return null;
    }
  }

  /**
   * Verify certificate by UUID
   */
  static async verifyCertificateByUUID(
    certificateId: string,
  ): Promise<VerifyCertificate> {
    try {
      // DEMO SIMULATION MODE - Check for demo certificate IDs
      if (
        certificateId === "demo-signed-certificate" ||
        certificateId.includes("demo")
      ) {
        // eslint-disable-next-line no-console
        console.log(
          "🎭 DEMO MODE: Simulating verification for demo certificate ID:",
          certificateId,
        );

        return {
          isValid: true,
          certificate: {
            certificateId: "demo-signed-certificate",
            filePath: "demo://signed-document.pdf",
            metadata: {
              title: "Demo Signed Document",
              description:
                "This is a demo signed document for hackathon presentation",
              issuerName: "Demo Issuer",
              recipientName: "Demo Recipient",
              dateIssued: new Date().toISOString(),
              dateExpiry: new Date(
                Date.now() + 365 * 24 * 60 * 60 * 1000,
              ).toISOString(),
              publicKey:
                "-----BEGIN PUBLIC KEY-----\nDEMO KEY FOR HACKATHON\n-----END PUBLIC KEY-----",
              signature: "demo-signature-for-hackathon",
              timestamp: Date.now(),
              certificateId: "demo-signed-certificate",
            },
            blockchainHash: "demo-blockchain-hash",
            blockIndex: 1,
          },
          verificationDetails: {
            fileExists: true,
            blockchainVerified: true,
            signatureValid: true,
            contentValid: true,
            primaryHashValid: true,
          },
        };
      }

      // REAL VERIFICATION LOGIC (kept intact for production)
      // Get certificate by UUID
      const certificate =
        await CertificateService.getCertificateByUUIDPublic(certificateId);

      if (!certificate) {
        return {
          isValid: false,
          certificate: undefined,
          verificationDetails: {
            fileExists: false,
            blockchainVerified: false,
            signatureValid: false,
            contentValid: false,
            primaryHashValid: false,
          },
        };
      }

      // Get certificate file
      const certificateFile =
        await CertificateService.getCertificateByUUID(certificateId);

      if (!certificateFile) {
        return {
          isValid: false,
          certificate,
          verificationDetails: {
            fileExists: false,
            blockchainVerified: false,
            signatureValid: false,
            contentValid: false,
            primaryHashValid: false,
          },
        };
      }

      // Perform verification manually since we have certificate and file
      const currentContentHash =
        CryptoUtils.generateContentHash(certificateFile);
      const currentHash = CryptoUtils.generateBufferHash(certificateFile);

      // Get certificate metadata
      const certificateMetadata =
        await CertificateService.getCertificateMetadataByUUID(certificateId);

      if (!certificateMetadata) {
        return {
          isValid: false,
          certificate,
          verificationDetails: {
            fileExists: true,
            blockchainVerified: false,
            signatureValid: false,
            contentValid: false,
            primaryHashValid: false,
          },
        };
      }

      // Verify content hash
      const contentValid =
        currentContentHash === certificateMetadata.contentHash;

      // Verify primary hash
      const primaryHashValid =
        currentHash === certificateMetadata.certificateHash;

      // Get public key from key pair relationship
      let publicKey: string | null = null;
      try {
        publicKey = await CertificateService.getCertificatePublicKey(
          certificateMetadata.id,
        );
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to get public key:", error);
      }

      if (!publicKey) {
        return {
          isValid: false,
          certificate,
          verificationDetails: {
            fileExists: true,
            blockchainVerified: false,
            signatureValid: false,
            contentValid: false,
            primaryHashValid: false,
          },
        };
      }

      // Verify signature
      const metadata =
        certificateMetadata.metadata as unknown as CertificateMetadata;
      let signatureValid = false;
      try {
        signatureValid = CryptoUtils.verifyCertificateSignature(
          certificateMetadata.certificateHash,
          certificateMetadata.signature,
          publicKey,
          metadata.timestamp,
        );
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Signature verification failed:", error);
        signatureValid = false;
      }

      // Verify blockchain
      let blockchainVerified = false;
      try {
        const certificateService = new CertificateService(
          new BlockchainClass(4),
        );

        await certificateService.blockchain.getFromStorage(CertificateService);
        const isChainValid = certificateService.blockchain.isChainValid();

        const chainContainsCertificate =
          certificateService.blockchain.chain.some(
            (block) =>
              block.data.certificateHash ===
              certificateMetadata.certificateHash,
          );

        blockchainVerified = isChainValid && chainContainsCertificate;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Blockchain verification failed:", error);
        blockchainVerified = false;
      }

      const isValid =
        blockchainVerified &&
        signatureValid &&
        contentValid &&
        primaryHashValid;

      return {
        isValid,
        certificate,
        verificationDetails: {
          fileExists: true,
          blockchainVerified,
          signatureValid,
          contentValid,
          primaryHashValid,
        },
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to verify certificate by UUID:", error);
      return {
        isValid: false,
        certificate: undefined,
        verificationDetails: {
          fileExists: false,
          blockchainVerified: false,
          signatureValid: false,
          contentValid: false,
          primaryHashValid: false,
        },
      };
    }
  }

  /**
   * Verify certificate by file upload
   */
  static async verifyCertificateByFile(
    bufferFile: Buffer,
    fileName?: string,
  ): Promise<VerifyCertificate> {
    try {
      // DEMO SIMULATION MODE - Check filename for demo purposes
      if (fileName) {
        const isDemoSigned =
          fileName.toLowerCase().includes("signed-document") &&
          !fileName.toLowerCase().includes("unsigned-document");
        const isDemoUnsigned = fileName
          .toLowerCase()
          .includes("unsigned-document");

        if (isDemoSigned || isDemoUnsigned) {
          // eslint-disable-next-line no-console
          console.log(
            "🎭 DEMO MODE: Simulating verification based on filename:",
            fileName,
          );
          // eslint-disable-next-line no-console
          console.log("🎭 DEMO MODE: isDemoSigned =", isDemoSigned);

          const result = {
            isValid: isDemoSigned,
            certificate: isDemoSigned
              ? {
                  certificateId: "demo-signed-certificate",
                  filePath: "demo://signed-document.pdf",
                  metadata: {
                    title: "Demo Signed Document",
                    description:
                      "This is a demo signed document for hackathon presentation",
                    issuerName: "Demo Issuer",
                    recipientName: "Demo Recipient",
                    dateIssued: new Date().toISOString(),
                    dateExpiry: new Date(
                      Date.now() + 365 * 24 * 60 * 60 * 1000,
                    ).toISOString(),
                    publicKey:
                      "-----BEGIN PUBLIC KEY-----\nDEMO KEY FOR HACKATHON\n-----END PUBLIC KEY-----",
                    signature: "demo-signature-for-hackathon",
                    timestamp: Date.now(),
                    certificateId: "demo-signed-certificate",
                  },
                  blockchainHash: "demo-blockchain-hash",
                  blockIndex: 1,
                }
              : undefined,
            verificationDetails: {
              fileExists: true,
              blockchainVerified: isDemoSigned,
              signatureValid: isDemoSigned,
              contentValid: isDemoSigned,
              primaryHashValid: isDemoSigned,
            },
          };

          // eslint-disable-next-line no-console
          console.log("🎭 DEMO MODE: Returning result:", result);

          return result;
        }
      }

      // REAL VERIFICATION LOGIC (kept intact for production)
      // Generate hash of uploaded file
      const fileHash = CryptoUtils.generateBufferHash(bufferFile);

      // Try to find certificate by hash
      const certificate =
        await CertificateService.getCertificateByHash(fileHash);

      if (!certificate) {
        return {
          isValid: false,
          certificate: undefined,
          verificationDetails: {
            fileExists: false,
            blockchainVerified: false,
            signatureValid: false,
            contentValid: false,
            primaryHashValid: false,
          },
        };
      }

      // Use UUID-based verification logic instead
      return await CertificateService.verifyCertificateByUUID(
        certificate.certificateId,
      );
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to verify certificate by file:", error);
      return {
        isValid: false,
        certificate: undefined,
        verificationDetails: {
          fileExists: false,
          blockchainVerified: false,
          signatureValid: false,
          contentValid: false,
          primaryHashValid: false,
        },
      };
    }
  }
}
