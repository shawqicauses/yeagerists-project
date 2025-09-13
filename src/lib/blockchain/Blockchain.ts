// REVIEWED

import fs from "fs/promises";
import path from "path";

import { Block, CertificateData } from "./Block";

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

  async saveToStorage(): Promise<void> {
    try {
      const directory = path.dirname(this.storagePath);
      await fs.mkdir(directory, { recursive: true });
      await fs.writeFile(this.storagePath, JSON.stringify(this.chain, null, 2));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error saving blockchain to storage:", error);
    }
  }

  async getFromStorage(): Promise<void> {
    try {
      const data = await fs.readFile(this.storagePath, "utf-8");
      const chainData = JSON.parse(data);

      // Re-construct blocks from stored data
      this.chain = chainData.map(
        (blockData: {
          data: CertificateData;
          hash: string;
          previousHash: string;
          nonce: number;
          timestamp: number;
          index: number;
        }) => {
          const block = new Block(
            blockData.index,
            blockData.timestamp,
            blockData.data,
            blockData.previousHash,
          );

          block.hash = blockData.hash;
          block.nonce = blockData.nonce;

          return block;
        },
      );
    } catch {
      // eslint-disable-next-line no-console
      console.log("No existing blockchain found, starting fresh");
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
