import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Vault } from "../target/types/vault";
import { Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram } from "@solana/web3.js";





describe("vault", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  const connection = provider.connection;
  const wallet = provider.wallet as anchor.Wallet;

  anchor.setProvider(provider);



  const program = anchor.workspace.vault as Program<Vault>;
  const user = Keypair.generate();

  before(async () => {
    const airdropsig = await connection.requestAirdrop(user.publicKey, 2 * LAMPORTS_PER_SOL)
    const latestBlockhash = (await connection.getLatestBlockhash());

    await connection.confirmTransaction({
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      signature: airdropsig
    })

    console.log(" ✅airdropped succeeded")
    console.log("🔫 balalnce : ", await connection.getBalance(user.publicKey));
  })

  let vaultPda: PublicKey;
  let vaultStatePda: PublicKey;
  let system_program: SystemProgram;
  let vaultBump: number;
  let vaultStateBump: number;

  it("Is initialized!", async () => {
    // Add your test here.

    [vaultPda, vaultBump] = await PublicKey.findProgramAddressSync([Buffer.from("vault"), user.publicKey.toBuffer()], program.programId);
    [vaultStatePda, vaultStateBump] = await PublicKey.findProgramAddressSync([Buffer.from("state"), vaultPda.toBuffer()], program.programId);

    // call to initialize

    const tx = await program.methods.initialize().accounts({
      user: user.publicKey
    }).signers([user]).rpc()

    console.log("✅ here is the transaction : - ", tx);
  });

  it("deposit", async() => {

  })
});











