"use server";

// REVIEWED - 01

import {
  Block,
  CertificateMetadata,
  CertificateService,
  CertificateSigned,
  getCertificateService,
} from "@/lib/blockchain";
import { VerifyCertificate } from "@/lib/blockchain/CertificateService";

export interface IssueCertificateResult {
  success: boolean;
  error?: string;
  certificate?: Pick<
    CertificateSigned,
    "certificateId" | "metadata" | "blockchainHash" | "blockIndex"
  >;
}

export interface VerifyCertificateResult {
  success: boolean;
  error?: string;
  verification?: VerifyCertificate;
}

export interface UserCertificatesResult {
  success: boolean;
  error?: string;
  certificates?: Array<
    Pick<
      CertificateSigned,
      "certificateId" | "metadata" | "blockchainHash" | "blockIndex"
    >
  >;
}

export interface BlockchainInfoResult {
  success: boolean;
  error?: string;
  blockchain?: {
    length: number;
    isValid: boolean;
    latestBlock: Pick<Block, "hash" | "timestamp" | "index">;
  };
}

/**
 * Issue a new certificate by signing a PDF
 */
export const issueCertificate = async function issueCertificate(
  data: { file: File; issuerId: number; userAccreditId: number } & Pick<
    CertificateMetadata,
    "title" | "description" | "issuerName" | "recipientName" | "dateExpiry"
  >,
): Promise<IssueCertificateResult> {
  try {
    if (!data.file || !data.issuerId || !data.userAccreditId) {
      return {
        success: false,
        error: "Missing required fields",
      };
    }

    // Validate file type
    if (data.file.type !== "application/pdf") {
      return {
        success: false,
        error: "Only PDF files are allowed",
      };
    }

    // Convert file to buffer
    const bufferFile = Buffer.from(await data.file.arrayBuffer());

    // Get certificate service
    const certificateService = await getCertificateService();

    // Issue certificate
    const certificateSigned = await certificateService.issueCertificate(
      data.issuerId,
      data.userAccreditId,
      bufferFile,
      {
        title: data.title,
        description: data.description,
        issuerName: data.issuerName,
        recipientName: data.recipientName,
        dateExpiry: data.dateExpiry || undefined,
      },
    );

    // Revalidate relevant paths...

    return {
      success: true,
      certificate: {
        certificateId: certificateSigned.certificateId,
        metadata: certificateSigned.metadata,
        blockchainHash: certificateSigned.blockchainHash,
        blockIndex: certificateSigned.blockIndex,
      },
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Certificate issuance failed:", error);
    return {
      success: false,
      error: "Failed to issue certificate",
    };
  }
};

/**
 * Verify a certificate
 */
export const verifyCertificate = async function verifyCertificate(
  certificateId: number,
): Promise<VerifyCertificateResult> {
  try {
    if (!certificateId) {
      return {
        success: false,
        error: "Certificate ID is required",
      };
    }

    const certificateService = await getCertificateService();
    const verification =
      await certificateService.verifyCertificate(certificateId);

    return {
      success: true,
      verification,
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Certificate verification failed:", error);
    return {
      success: false,
      error: "Failed to verify certificate",
    };
  }
};

/**
 * Get all certificates for a user
 */
export const getUserCertificates = async function getUserCertificates(
  userAccreditId: number,
): Promise<UserCertificatesResult> {
  try {
    if (!userAccreditId) {
      return {
        success: false,
        error: "User ID is required",
      };
    }

    const certificates =
      await CertificateService.getUserCertificates(userAccreditId);

    return {
      success: true,
      certificates: certificates.map((cert) => ({
        certificateId: cert.certificateId,
        metadata: cert.metadata,
        blockchainHash: cert.blockchainHash,
        blockIndex: cert.blockIndex,
      })),
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to get user certificates:", error);
    return {
      success: false,
      error: "Failed to get user certificates",
    };
  }
};

/**
 * Get all certificates issued by an issuer
 */
export const getIssuerCertificates = async function getIssuerCertificates(
  issuerId: number,
): Promise<UserCertificatesResult> {
  try {
    if (!issuerId) {
      return {
        success: false,
        error: "Issuer ID is required",
      };
    }

    const certificates =
      await CertificateService.getIssuerCertificates(issuerId);

    return {
      success: true,
      certificates: certificates.map((cert) => ({
        certificateId: cert.certificateId,
        metadata: cert.metadata,
        blockchainHash: cert.blockchainHash,
        blockIndex: cert.blockIndex,
      })),
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to get issuer certificates:", error);
    return {
      success: false,
      error: "Failed to get issuer certificates",
    };
  }
};

/**
 * Download certificate file
 */
export const certificateDownload = async function certificateDownload(
  certificateId: string,
): Promise<{ success: boolean; error?: string; bufferFile?: string }> {
  try {
    if (!certificateId) {
      return {
        success: false,
        error: "Certificate ID is required",
      };
    }

    const bufferFile =
      await CertificateService.certificateDownload(certificateId);

    if (!bufferFile) {
      return {
        success: false,
        error: "Certificate not found",
      };
    }

    // Convert Buffer to base64 string for client component compatibility
    const base64File = bufferFile.toString("base64");

    return {
      success: true,
      bufferFile: base64File,
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to download certificate:", error);
    return {
      success: false,
      error: "Failed to download certificate",
    };
  }
};

/**
 * Verify a certificate by UUID
 */
export const verifyCertificateByUUID = async function verifyCertificateByUUID(
  certificateId: string,
): Promise<VerifyCertificateResult> {
  try {
    if (!certificateId) {
      return {
        success: false,
        error: "Certificate ID is required",
      };
    }

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(certificateId)) {
      return {
        success: false,
        error: "In-valid certificate ID format",
      };
    }

    const verification =
      await CertificateService.verifyCertificateByUUID(certificateId);

    return {
      success: true,
      verification,
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Certificate UUID verification failed:", error);
    return {
      success: false,
      error: "Failed to verify certificate",
    };
  }
};

/**
 * Verify a certificate by uploading a PDF file
 */
export const verifyCertificateByFile = async function verifyCertificateByFile(
  file: File,
): Promise<VerifyCertificateResult> {
  try {
    if (!file) {
      return {
        success: false,
        error: "File is required",
      };
    }

    // Validate file type
    if (file.type !== "application/pdf") {
      return {
        success: false,
        error: "Only PDF files are allowed",
      };
    }

    // Convert file to buffer
    const bufferFile = Buffer.from(await file.arrayBuffer());

    const verification = await CertificateService.verifyCertificateByFile(
      bufferFile,
      file.name,
    );

    return {
      success: true,
      verification,
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Certificate file verification failed:", error);
    return {
      success: false,
      error: "Failed to verify certificate file",
    };
  }
};

/**
 * Get blockchain information
 */
export const getBlockchainInfo =
  async function getBlockchainInfo(): Promise<BlockchainInfoResult> {
    try {
      const certificateService = await getCertificateService();
      const blockchainInfo = certificateService.getBlockchainInfo();

      return {
        success: true,
        blockchain: {
          length: blockchainInfo.length,
          isValid: blockchainInfo.isValid,
          latestBlock: {
            hash: blockchainInfo.latestBlock.hash,
            timestamp: blockchainInfo.latestBlock.timestamp,
            index: blockchainInfo.latestBlock.index,
          },
        },
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to get blockchain info:", error);
      return {
        success: false,
        error: "Failed to get blockchain info",
      };
    }
  };
