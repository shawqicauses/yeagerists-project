// REVIEWED

import { Blockchain } from "./Blockchain";
import { CertificateService } from "./CertificateService";

// Singleton instance
let blockchainInstance: Blockchain | null = null;
let certificateServiceInstance: CertificateService | null = null;

/**
 * Get or create blockchain instance
 */
export const getBlockchain = (): Blockchain => {
  if (!blockchainInstance) blockchainInstance = new Blockchain(2); // Difficulty of 2 for faster mining

  return blockchainInstance;
};

/**
 * Get or create certificate service instance
 */
export const getCertificateService = async (): Promise<CertificateService> => {
  if (!certificateServiceInstance) {
    const blockchain = getBlockchain();
    certificateServiceInstance = new CertificateService(blockchain);
    await certificateServiceInstance.initialize();
  }

  return certificateServiceInstance;
};

// Export all classes and utilities
export type { Block, CertificateData } from "./Block";
export { Blockchain } from "./Blockchain";
export { CertificateService } from "./CertificateService";
export type {
  CertificateMetadata,
  CertificateSigned,
} from "./CertificateService";
export { CryptoUtils } from "./CryptoUtils";
export type { CertificateSignature, KeyPair } from "./CryptoUtils";
