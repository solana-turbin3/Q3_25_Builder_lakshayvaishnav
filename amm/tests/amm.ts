import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Amm } from "../target/types/amm";
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { createMint, Account, getOrCreateAssociatedTokenAccount, ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token"
import { BN } from "bn.js";
import { randomBytes } from "node:crypto"
import { SYSTEM_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/native/system";
describe("amm", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider)
  const program = anchor.workspace.amm as Program<Amm>;

  const connection = provider.connection
  let initalizer = Keypair.generate();

  let mintX: PublicKey;
  let mintY: PublicKey;
  let mintLp: PublicKey;
  let configPda: PublicKey;
  let vaultY: Account;
  let vaultX: Account;
  const seed = new BN(randomBytes(8))

  before(async () => {

    await airdrop(initalizer.publicKey, connection);

    mintX = await createMint(
      connection,
      initalizer,
      initalizer.publicKey,
      null,
      6,
    )

    mintY = await createMint(
      connection,
      initalizer,
      initalizer.publicKey,
      null,
      6
    )

    mintLp = await createMint(
      connection,
      initalizer,
      configPda,
      null,
      8,
    )

    console.log("⚡ mint x : ", mintX.toBase58());
    console.log("⚡ mint y : ", mintY.toBase58());
    console.log("⚡ mint lp : ", mintLp.toString());

    [configPda,] = PublicKey.findProgramAddressSync(
      [Buffer.from("config"),
      seed.toArrayLike(Buffer, "le", 8),
      ],
      program.programId);

    console.log("✅ config pda : ", configPda.toBase58());

  });



  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize(seed, 25, initalizer.publicKey).accountsPartial({
      initializer: initalizer.publicKey,
      mintX,
      mintY,
      config: configPda,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SYSTEM_PROGRAM_ID,
      tokenProgram: TOKEN_PROGRAM_ID
    }).signers([initalizer]).rpc({ commitment: "confirmed" })

    console.log("✅ inited amm : ", tx.toString());
  });
});



// --------------- helper function
async function airdrop(address: PublicKey, connection: Connection) {
  const sig = await connection.requestAirdrop(address, 2 * LAMPORTS_PER_SOL);
  const blockhash = await connection.getLatestBlockhash();
  await connection.confirmTransaction({
    blockhash: blockhash.blockhash,
    lastValidBlockHeight: blockhash.lastValidBlockHeight,
    signature: sig
  });

  console.log("balance is : ", await connection.getBalance(address));
}