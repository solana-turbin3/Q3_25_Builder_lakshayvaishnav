import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Marketplace } from "../target/types/marketplace";
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";


describe("marketplace", () => {

  const provider = anchor.AnchorProvider.env();

  anchor.setProvider(provider);

  const program = anchor.workspace.marketplace as Program<Marketplace>;
  const connection = provider.connection

  let admin: Keypair;
  let marketplacePda: PublicKey;

  let treasuryPda: PublicKey;

  let rewardsMintPda: PublicKey;

  let systemProgram: PublicKey;
  let tokenProgram: PublicKey;

  let name: string;
  let fee: number;



  before(async () => {

    name = "Bored ape"
    fee = 100;

    admin = Keypair.generate();
    await airdrop(admin.publicKey, connection);

    [marketplacePda] = await PublicKey.findProgramAddressSync(
      [Buffer.from("marketplace"), Buffer.from(name)],
      program.programId
    );

    [treasuryPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("treasury"), marketplacePda.toBuffer()],
      program.programId
    );

    [rewardsMintPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("rewards"), marketplacePda.toBuffer()],
      program.programId
    )

    systemProgram = SystemProgram.programId;
    tokenProgram = TOKEN_PROGRAM_ID;

  })

  it("it runs initialize ixn", async () => {



    let tx = await program.methods
      .initialize(name, fee)
      .accountsPartial({
        admin: admin.publicKey,
        marketplace: marketplacePda,
        rewardsMint: rewardsMintPda,
        systemProgram: systemProgram,
        tokenProgram: tokenProgram,
        treasury: treasuryPda
      })
      .signers([admin])
      .rpc()

  });
});

//---------------- helper function 
async function airdrop(user: PublicKey, connection: Connection) {

  const signature = await connection.requestAirdrop(user, 5 * LAMPORTS_PER_SOL);

  const blockhash = await connection.getLatestBlockhash();
  await connection.confirmTransaction({
    blockhash: blockhash.blockhash,
    lastValidBlockHeight: blockhash.lastValidBlockHeight,
    signature: signature
  })
  console.log(`✅ airdrop successfull for ${user} balance : ${await connection.getBalance(user)} `)

}