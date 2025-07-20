import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Amm } from "../target/types/amm";
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { createMint, Account, getOrCreateAssociatedTokenAccount, ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, mintTo, getAssociatedTokenAddress } from "@solana/spl-token"
import { BN } from "bn.js";
import { randomBytes } from "node:crypto"
import { program, SYSTEM_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/native/system";
describe("amm", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider)
  const program = anchor.workspace.amm as Program<Amm>;

  const connection = provider.connection
  let initalizer = Keypair.generate();
  let user = Keypair.generate();

  let mintX: PublicKey;
  let mintY: PublicKey;
  let mintLp: PublicKey;
  let configPda: PublicKey;
  let vaultY: Account;
  let vaultX: Account;
  let userX: Account;
  let userY: Account;
  let userLp: PublicKey;
  const seed = new BN(randomBytes(8))

  before(async () => {

    await airdrop(initalizer.publicKey, connection);
    await airdrop(user.publicKey, connection);

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



    userX = await getOrCreateAssociatedTokenAccount(
      connection,
      user,
      mintX,
      user.publicKey
    )
    userY = await getOrCreateAssociatedTokenAccount(
      connection,
      user,
      mintY,
      user.publicKey
    )

    const tx1 = await mintTo(
      connection,
      user,
      mintX,
      userX.address,
      initalizer,
      100_000_000
    )

    const tx2 = await mintTo(
      connection,
      user,
      mintY,
      userY.address,
      initalizer,
      100_000_000
    )



    console.log("⚡ mint x : ", mintX.toBase58());
    console.log("⚡ mint y : ", mintY.toBase58());
    console.log("tx 1 : ", tx1);
    console.log("tx 2 : ", tx2);

    [configPda,] = PublicKey.findProgramAddressSync(
      [Buffer.from("config"),
      seed.toArrayLike(Buffer, "le", 8),
      ],
      program.programId);

    console.log("✅ config pda : ", configPda.toBase58());


    [mintLp,] = PublicKey.findProgramAddressSync(
      [Buffer.from("lp"), configPda.toBuffer()],
      program.programId
    );

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

  it("Deposit", async () => {
    const tx = await program.methods.deposit(
      new BN(10_000_000),
      new BN(10_000_000),
      new BN(10_000_000)).accountsPartial(
        {
          user: user.publicKey,
          mintX,
          mintY,
          config: configPda,
          userX: userX.address,
          userY: userY.address,
          mintLp,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SYSTEM_PROGRAM_ID,
          tokenProgram: TOKEN_PROGRAM_ID
        }
      ).signers([user]).rpc({ commitment: "confirmed" })

    console.log("✅ deposited toknes : ", tx.toString())
  })
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