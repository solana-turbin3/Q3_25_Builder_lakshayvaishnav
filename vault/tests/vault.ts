import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Vault } from "../target/types/vault";
import { Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram } from "@solana/web3.js";
import { assert } from "chai";






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

    [vaultStatePda, vaultStateBump] = await PublicKey.findProgramAddressSync([Buffer.from("state"), user.publicKey.toBuffer()], program.programId);
    [vaultPda, vaultBump] = await PublicKey.findProgramAddressSync([Buffer.from("vault"), vaultStatePda.toBuffer()], program.programId);

    // call to initialize

    const tx = await program.methods.initialize().accounts({
      user: user.publicKey
    }).signers([user]).rpc()

    console.log("✅ initialized :  ", tx);

    // fetch and assert vault state bumps
    const state = await program.account.vaultState.fetch(vaultStatePda);
    console.log("state : ", state);
    assert.equal(state.vaultBump, vaultBump);
    assert.equal(state.stateBump, vaultStateBump);

    // assert vault has rent-exempt balance
    const vaultBalance = await connection.getBalance(vaultPda);
    const rentExempt = await connection.getMinimumBalanceForRentExemption(
      (await connection.getAccountInfo(vaultPda))!.data.length
    )

    assert.ok(vaultBalance === rentExempt);
  });

  it("deposit", async () => {
    const depositAmount = new anchor.BN(0.5 * LAMPORTS_PER_SOL);

    const tx = await program.methods.deposit(depositAmount).accounts({
      user: user.publicKey
    }).signers([user])
      .rpc()

    console.log("✅ deposited tx : ", tx);

    // assert the balance
    const vaultBalance = await connection.getBalance(vaultPda);

    const rentExempt = await connection.getMinimumBalanceForRentExemption(
      (await connection.getAccountInfo(vaultPda))!.data.length
    )

    assert.equal((vaultBalance - rentExempt), Number(depositAmount));

  })

  it("withdraws", async () => {
    const withdrawAmount = new anchor.BN(0.1 * LAMPORTS_PER_SOL);
    const vaultBalanceBeforeWithdraw = await connection.getBalance(vaultPda);


    const signerSeeds = PublicKey.findProgramAddressSync([Buffer.from("vault"), vaultStatePda.toBuffer()], program.programId);
    const tx = await program.methods.withdraw(withdrawAmount).accounts({
      user: user.publicKey
    }).signers([user])
      .rpc()

    const vaultBalanceAfterWithdraw = await connection.getBalance(vaultPda)

    console.log("✅ withdraw tx : ", tx)

    assert.equal(vaultBalanceBeforeWithdraw, vaultBalanceAfterWithdraw + Number(withdrawAmount))
  })

  it("close the vault", async () => {

    const tx = await program.methods.closeVault().accounts({
      user: user.publicKey
    }).signers([user]).rpc();

    console.log("✅ close successfully : ", tx);

    let vaultAccountInfo = await connection.getAccountInfo(vaultPda);
    let vaultStateAccountInfo = await connection.getAccountInfo(vaultStatePda);
    
    assert.ok(vaultAccountInfo === null);
    assert.ok(vaultStateAccountInfo === null);
  })
});











