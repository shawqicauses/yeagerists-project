// REVIEWED - 03

import path from "path";

import { Blockchain as BlockchainType } from "@/payload-types";

import { Block, CertificateData } from "./Block";
// eslint-disable-next-line import/no-cycle
import { CertificateService } from "./CertificateService";

// Interface for stored block data in PayLoad
interface BlockDateStored {
  data: CertificateData;
  hash: string;
  previousHash: string;
  nonce: number;
  timestamp: number;
  index: number;
}

// Type guard function to check if data is valid chain data
const isChainData = (data: unknown): data is BlockDateStored[] => {
  if (!Array.isArray(data)) return false;

  return data.every(
    (item) =>
      item !== null &&
      typeof item === "object" &&
      "data" in item &&
      "hash" in item &&
      "previousHash" in item &&
      "nonce" in item &&
      "timestamp" in item &&
      "index" in item &&
      typeof item.hash === "string" &&
      typeof item.previousHash === "string" &&
      typeof item.nonce === "number" &&
      typeof item.timestamp === "number" &&
      typeof item.index === "number" &&
      item.data !== null &&
      typeof item.data === "object" &&
      "issuerId" in item.data &&
      "userAccreditId" in item.data &&
      "certificateHash" in item.data &&
      "publicKey" in item.data &&
      "timestamp" in item.data,
  );
};

export class Blockchain {
  public chain: Block[];

  public difficulty: number;

  private storagePath: string;

  constructor(difficulty: number, storagePath?: string) {
    this.chain = [Blockchain.createGenesisBlock()];

    this.difficulty = difficulty;

    this.storagePath =
      storagePath || path.join(process.cwd(), "data", "blockchain.json");
  }

  private static createGenesisBlock(): Block {
    const genesisData: CertificateData = {
      issuerId: "genesis",
      userAccreditId: "genesis",
      certificateHash: "0",
      publicKey: "0",
      timestamp: Date.now(),
    };

    // Create first block in chain (genesis block)
    return new Block(0, Date.now(), genesisData, "0");
  }

  getLatestBlock(): Block {
    return this.chain[this.chain.length - 1];
  }

  insertBlock(certificateData: CertificateData): Block {
    const newBlock = new Block(
      this.chain.length,
      Date.now(),
      certificateData,
      this.getLatestBlock().hash,
    );

    newBlock.mineBlock(this.difficulty);
    this.chain.push(newBlock);

    // Save to storage
    this.saveToStorage();

    return newBlock;
  }

  isChainValid(): boolean {
    return this.chain.every((currentBlock, i) => {
      if (i === 0) return true; // Genesis block is always valid

      const previousBlock = this.chain[i - 1];

      // Check if current block is valid
      if (!currentBlock.isValid()) return false;

      // Check if current block points to previous block
      return currentBlock.previousHash === previousBlock.hash;
    });
  }

  verifyCertificate(certificateHash: string, publicKey: string): boolean {
    return this.chain.some(
      (block) =>
        block.data.certificateHash === certificateHash &&
        block.data.publicKey === publicKey,
    );
  }

  getCertificateHistory(userAccreditId: string): CertificateData[] {
    return this.chain
      .filter((block) => block.data.userAccreditId === userAccreditId)
      .map((block) => block.data);
  }

  getIssuerCertificates(issuerId: string): CertificateData[] {
    return this.chain
      .filter((block) => block.data.issuerId === issuerId)
      .map((block) => block.data);
  }

  async saveToStorage(
    certificateService?: typeof CertificateService,
  ): Promise<void> {
    try {
      if (!certificateService) {
        // eslint-disable-next-line no-console
        console.warn("No certificate service provided for blockchain storage");
        return;
      }

      const blockchainData: Omit<
        BlockchainType,
        "id" | "createdAt" | "updatedAt"
      > = {
        chainId: "main",
        chainData: this.chain,
        length: this.chain.length,
        difficulty: this.difficulty,
        isValid: this.isChainValid(),
        latestBlockHash: this.getLatestBlock().hash,
        certificatesCount: this.chain.filter(
          (block) => block.data.issuerId !== "genesis",
        ).length,
        mindedAt: new Date().toISOString(),
      };

      await certificateService.saveBlockchain(blockchainData);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error saving blockchain to PayLoad:", error);
    }
  }

  async getFromStorage(
    certificateService?: typeof CertificateService,
  ): Promise<void> {
    try {
      if (!certificateService) {
        // eslint-disable-next-line no-console
        console.warn("No certificate service provided for blockchain storage");
        return;
      }

      const blockchainStored = await certificateService.getBlockchain();

      if (!blockchainStored) {
        // eslint-disable-next-line no-console
        console.log("No existing blockchain found, starting fresh");
        return;
      }

      // Re-construct blocks from stored data
      const { chainData } = blockchainStored;
      if (isChainData(chainData)) {
        this.chain = chainData.map((blockData: BlockDateStored) => {
          const block = new Block(
            blockData.index,
            blockData.timestamp,
            blockData.data,
            blockData.previousHash,
          );

          block.hash = blockData.hash;
          block.nonce = blockData.nonce;

          return block;
        });
      } else {
        // eslint-disable-next-line no-console
        console.warn("In-valid chain data structure found, starting fresh");
        this.chain = [Blockchain.createGenesisBlock()];
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log("Error loading blockchain from PayLoad:", error);
    }
  }

  getChainInfo(): { length: number; isValid: boolean; latestBlock: Block } {
    return {
      length: this.chain.length,
      isValid: this.isChainValid(),
      latestBlock: this.getLatestBlock(),
    };
  }
}
