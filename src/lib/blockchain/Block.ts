// REVIEWED

import crypto from "crypto";

export interface CertificateData {
  issuerId: string;
  userAccreditId: string;
  certificateHash: string;
  publicKey: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export class Block {
  public data: CertificateData;

  public hash: string;

  public previousHash: string;

  public nonce: number;

  public timestamp: number;

  public index: number;

  constructor(
    index: number,
    timestamp: number,
    data: CertificateData,
    previousHash: string = "",
  ) {
    this.data = data;

    this.hash = this.calculateHash();
    this.previousHash = previousHash;

    this.nonce = 0;
    this.timestamp = timestamp;

    this.index = index;
  }

  calculateHash(): string {
    const dataString = JSON.stringify({
      data: this.data,
      previousHash: this.previousHash,
      nonce: this.nonce,
      timestamp: this.timestamp,
      index: this.index,
    });

    return crypto.createHash("sha256").update(dataString).digest("hex");
  }

  mineBlock(difficulty: number): void {
    const target = Array(difficulty + 1).join("0");

    while (this.hash.substring(0, difficulty) !== target) {
      this.hash = this.calculateHash();
      this.nonce += 1;
    }

    // eslint-disable-next-line no-console
    console.log(`Block mined: ${this.hash}`);
  }

  isValid(): boolean {
    return this.hash === this.calculateHash();
  }
}
