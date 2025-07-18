# Lakshay's Turbin3 Q3 2025 codebase 🦀

<div align="center">
  <img src="https://github.com/solana-turbin3/Q1_25_Builder_daniel-burlacu/blob/main/turbine-logo-text.png" alt="Logo" width="400">
</div>

This is a comprehensive reference to the code I wrote and edited while learning in the Solana Turbin3 Program (Builder Cohort).

---

## 📖 Overview
This repository contains a collection of Solana programs and supporting scripts developed as part of the Solana Turbin3 Builder Cohort. The codebase covers a range of DeFi and NFT primitives, including AMMs, vaults, marketplaces, escrows, and staking, as well as prerequisite exercises in both Rust and TypeScript.

## 📂 Content/Folders
- [amm/](amm/): Automated Market Maker (AMM) Anchor program for decentralized token swaps.
- [vault/](vault/): Anchor program for secure asset vaults (deposits, withdrawals, and management).
- [marketplace/](marketplace/): Anchor program for a decentralized marketplace (likely for NFTs or tokens).
- [escrow/](escrow/): Anchor program for escrowed transactions between parties.
- [nft-staking/](nft-staking/): Anchor program for staking NFTs and earning rewards.
- [solana-starter/](solana-starter/): Starter code and scripts for Solana development, with both Rust (`rs/`) and TypeScript (`ts/`) examples.
- [prereq-rs/](prereq-rs/): Rust prerequisite exercises for Solana development (keygen, airdrop, transfer, etc.).
- [prereq-ts/](prereq-ts/): TypeScript prerequisite scripts for Solana basics (keygen, airdrop, transfer, enroll, etc.).

## 🚀 Getting Started

### Prerequisites
- [Rust](https://www.rust-lang.org/tools/install)
- [Anchor](https://www.anchor-lang.com/docs/installation)
- [Node.js](https://nodejs.org/) & [Yarn](https://yarnpkg.com/) or npm
- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools)

### Installation
Clone the repository:
```bash
git clone <this-repo-url>
cd Q3_25_Builder_lakshayvaishnav
```

Install dependencies for each module as needed. For example:
```bash
cd amm
yarn install # or npm install
cd ..
cd solana-starter/ts
yarn install # or npm install
```

## 🧪 Usage
- Each folder contains its own Anchor or Node.js project. Refer to the `programs/`, `src/`, or `scripts/` directories within each for entry points.
- To build and test an Anchor program (e.g., AMM):
  ```bash
  cd amm
  anchor build
  anchor test
  ```
- For TypeScript scripts (e.g., airdrop, transfer):
  ```bash
  cd prereq-ts
  yarn keygen
  yarn airdrop
  yarn transfer
  ```
- For Rust prerequisite exercises:
  ```bash
  cd prereq-rs
  cargo run --bin <binary-name>
  ```

## 🤝 Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## 📄 License
[MIT](LICENSE) (or specify your license here)

## 📬 Contact
Lakshay Vaishnav - [Your Email or Discord]

---

> This repository is part of the Solana Turbin3 Builder Cohort Q3 2025.
