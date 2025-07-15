import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Escrow } from "../target/types/escrow";
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, sendAndConfirmTransaction } from "@solana/web3.js";
import { Account, ASSOCIATED_TOKEN_PROGRAM_ID, createMint, getAssociatedTokenAddressSync, getOrCreateAssociatedTokenAccount, mintTo, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { BN } from "bn.js";
import { randomBytes } from "node:crypto"
import { SYSTEM_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/native/system";

describe("escrow", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.escrow as Program<Escrow>;
  const connection = provider.connection;

  let maker: Keypair;
  let taker: Keypair;
  let mintA: PublicKey;
  let mintB: PublicKey;

  let makerAtaA: Account;
  let makerAtaB: Account;

  let takerAtaA: Account;
  let takerAtaB: Account;

  let vault: PublicKey;
  let escrow: PublicKey;
  let bump: number;


  const seed = new BN(randomBytes(8))

  before(async () => {
    // create required accounts
    maker = Keypair.generate();
    taker = Keypair.generate();

    await airdrop(connection, maker.publicKey, 5);
    await airdrop(connection, taker.publicKey, 5)

    mintA = await createMint(
      connection,
      maker,
      maker.publicKey,
      null,
      6
    )
    console.log("✅ mint A created : ", mintA.toBase58());

    mintB = await createMint(
      connection,
      taker,
      taker.publicKey,
      null,
      6
    )
    console.log("✅ mint B created : ", mintB.toBase58());

    makerAtaA = await getOrCreateAssociatedTokenAccount(
      connection,
      maker,
      mintA,
      maker.publicKey
    )
    console.log("✅ created maker ATA A : ", makerAtaA.address.toBase58());

    makerAtaB = await getOrCreateAssociatedTokenAccount(
      connection,
      maker,
      mintB,
      maker.publicKey
    )
    console.log("✅ created maker ATA B : ", makerAtaB.address.toBase58())

    takerAtaA = await getOrCreateAssociatedTokenAccount(
      connection,
      taker,
      mintA,
      taker.publicKey
    )
    console.log("✅ created taker ATA A : ", takerAtaA.address.toBase58())

    takerAtaB = await getOrCreateAssociatedTokenAccount(
      connection,
      taker,
      mintB,
      taker.publicKey
    )
    console.log(" ✅created taker ATA B : ", takerAtaB.address.toBase58())


    // minting token A to taker and token B to maker
    let mintAtx = await mintTo(connection, maker, mintA, makerAtaA.address, maker, 10000 * 10 ** 6);
    console.log("✅ mint A tx : ", mintAtx.toString());

    let mintBtx = await mintTo(connection, taker, mintB, takerAtaB.address, taker, 20000 * 10 ** 6);
    console.log("✅ mint B tx: ", mintBtx.toString());

    [escrow, bump] = PublicKey.findProgramAddressSync(
      [Buffer.from("escrow"),
      maker.publicKey.toBuffer(),
      seed.toArrayLike(Buffer, "le", 8)],
      program.programId)

    console.log("✅ created escrow account : ", escrow.toBase58());


    const vault = getAssociatedTokenAddressSync(mintA, escrow, true);
    console.log(" ✅vault created : ", vault.toBase58());
  })


  it("MAKE ESCROW", async () => {

    // currently depositing and requesting same amount
    const initTx = await program.methods.make(seed, new BN(1_000_000_000), new BN(1_000_000_000)).accounts({
      maker: maker.publicKey,
      mintA: mintA,
      mintB: mintB,
      tokenProgram: TOKEN_PROGRAM_ID,
    }).signers([maker]).rpc({ commitment: "confirmed" })

    console.log("✅ escrow created : ", initTx.toString());

  })

  it("REQUEST REFUND", async () => {


    const tx = await program.methods.refund(seed).accountsPartial({
      maker: maker.publicKey,
      mintA: mintA,
      makerAtaA: makerAtaA.address,
      escrow: escrow,
      vault: vault,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    }).signers([maker]).rpc({ commitment: "confirmed" })


    console.log("✅ your refund tx : ", tx.toString())
  })

  it("CREATE ESCROW AGAIN", async () => {
    const tx = await program.methods.make(seed, new BN(1_000_000_000), new BN(1_000_000_000)).accountsPartial({
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      escrow: escrow,
      maker: maker.publicKey,
      makerAtaA: makerAtaA.address,
      mintA: mintA,
      mintB: mintB,
      vault: vault,
      systemProgram: SYSTEM_PROGRAM_ID,
      tokenProgram: TOKEN_PROGRAM_ID
    }).signers([maker]).rpc({ commitment: "confirmed" })
    console.log("✅ created escrow again : ", tx)


  })

  it("TAKE", async () => {
    const tx = await program.methods.take().accountsPartial({
      escrow,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      maker: maker.publicKey,
      taker: taker.publicKey,
      mintA: mintA,
      mintB: mintB,
      systemProgram: SYSTEM_PROGRAM_ID,
      tokenProgram: TOKEN_PROGRAM_ID,
      takerAtaA: takerAtaA.address,
      takerAtaB: takerAtaB.address,
      vault: vault,
      makerAtaB: makerAtaB.address


    }).signers([taker]).rpc({ commitment: "confirmed" })

    console.log("✅ take signature : ", tx.toString())
  })


  async function airdrop(connection: Connection, address: PublicKey, amount: number) {
    const lamports = amount * LAMPORTS_PER_SOL
    const airdropSignature = await connection.requestAirdrop(address, lamports);

    const blockhash = await connection.getLatestBlockhash()

    await connection.confirmTransaction({
      blockhash: blockhash.blockhash,
      lastValidBlockHeight: blockhash.lastValidBlockHeight,
      signature: airdropSignature
    });

    console.log("airdrop complete. tx signature : ", await connection.getBalance(address))

  }
});
