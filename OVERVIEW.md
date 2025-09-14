<!-- REVIEWED -->

# Yeagerists Verification - Blockchain Backed Certification Verification System

## Problem

Our project tackles the growing problem of certificate fraud and verification. Today, digital certificates are often sent as PDFs, which can be altered, copied, or misrepresented. This creates risks for universities, employers, and individuals who rely on the authenticity of these documents. With constant new innovations and tool accessibility, it is easier than ever to forge an accreditation/certificate. Tools such as photoshop, metadata editors, and recently, AI, forging certificates can take just a few inputs.

## Our Solution

We have created an MVP that consists of a sign-in, sign-up, achievement portal, issuer portal and verification portal. A user can certify a qualification in the issuer portal, and verify the integrity of a PDF certification via the verification portal. Thy can also view their past achievements.

### Solution Breakdown

#### Encryption and Cybersecurity

The app consists of many measures to authenticate certificates.

A modular key pair encryption method is the initial approach. The certification data is used to create a public and private key. The public key can only be decrypted if you have the associated private key. The private key is stored in the database while the public key is stored in the PDF files metadata. When the public key is stored in the PDF files metadata, it is stored in a newly created field called Public Key. Along with other metadata, the certification data and its associated public key are hashed using SHA-256 and stored in a block in our blockchain simulation.

#### Blockchain

The blockchain module provides an immutable record of certificate authenticity. The certificate data and its associated public key are then hashed and stored in a block, which links to the previous block to form a chain. Each block is mined by adjusting a nonce variable until the hash meets a set difficulty (This is a length of 0s in the hash), making tampering recourse intensive. When a PDF is uploaded for verification, its certificate data and public key are re-hashed and compared against the blockchain. If the hash matches, the certificate is confirmed as authentic. If it is not, it is flagged as fraudulent. This system ensures tamper detection, independent verification, and long-term trust in issued certificates.

When implementing external blockchain platforms into our MVP, we ran into numerous roadblocks. As a MVP solution we developed a feature-rich simulated blockchain. This simulation includes block mining, certificate verification, immutable storage and validation checks.

#### Block Mining

A process of securing data in a blockchain. Each block is validated by solving a cryptographic challenge. This ensure the data is untampered with and linked to a trusted chain. For our MVP, we use a ‘difficulty’ of 2 – 4 (hash length). This implements added security while keeping runtime low for the purpose of presentations and demos.

### Blockchain Solutions

1. Creates immutable signing history.
2. Adds a timestamp to the certification. (If issues of certification dates are in question.)
3. Block-Chain is public, anyone can verify that the pdf has not been tampered with.
4. The signer cannot deny that they signed the pdf.

## Gamification

A verification application is useless without users. Thus, the app consists of several gamified components to make verification fun and extra interactive.

### Gamification Features

1. Achievement based badges: To reward users for logins and verifying files, unique badges are awarded as progress is made.
2. Levels: The user’s level is determined by the number of verified certificates.

## Tech Stack

- Blockchain Logic: Custom lightweight blockchain class (mining, validation, verification)
- Database: PostgreSQL, Payload CMS
- Back-End: PayLoad CMS, Next.JS, Node.JS, TypeScript
- Front-End: Next.JS, React, ShadCN, Tailwind CSS

## Impact

Yeagerists Verification ensures that certificates are trustworthy, verifiable, and tamper-proof in a fun and interactive way.
