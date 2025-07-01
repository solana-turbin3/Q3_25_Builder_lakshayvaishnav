import { clusterApiUrl, Connection, Keypair, PublicKey } from "@solana/web3.js";
import wallet from "./wallet.json";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { AnchorProvider, Program, Wallet } from "@coral-xyz/anchor";
import { IDL, Turbin3Prereq } from "./programs/Turbin3_prereq";
import { SYSTEM_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/native/system";

const mintCollection = new
    PublicKey("5ebsp5RChCGK7ssRZMVMufgVZhd2kFbNaotcZ5UvytN2");

// converting encoded base58
const base58Secret = wallet;
const secretBytes = bs58.decode(base58Secret.secret_key);
console.log("secret key : ", new Uint8Array(secretBytes))

const keypair = Keypair.fromSecretKey(new Uint8Array(secretBytes));
console.log("keypair publickey: ", keypair.publicKey)



const MPL_CORE_PROGRAM_ID = new PublicKey("CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d")
const connection = new Connection(clusterApiUrl("devnet"))

const provider = new AnchorProvider(connection, new Wallet(keypair), {
    commitment: "confirmed"
})

const program: Program<Turbin3Prereq> = new Program<Turbin3Prereq>(IDL, provider);

const account_seeds = [Buffer.from("prereqs"), keypair.publicKey.toBuffer()];

const [account_key, account_bump] = PublicKey.findProgramAddressSync(account_seeds, program.programId);


// execute the initialize transcations 

// (async () => {
//     try {
//         const txhash = await program.methods.initialize("lakshayvaishnav").accountsPartial({
//             user: keypair.publicKey,
//             account: account_key,
//             system_program: SYSTEM_PROGRAM_ID
//         }).signers([keypair]).rpc({ commitment: "confirmed" });
//         console.log(` init tx : ${txhash}`)
//         console.log(`success check out your tx here : https://explorer.solana.com/tx/${txhash}?cluster=devnet`);

//     } catch (error) {
//         console.error(`oops something went wrong : ${error}`)
//     }
// })();



// // execute the submitts transactaion

// const mintTs = Keypair.generate();
// (async () => {
//     try {
//         const txhash = await program.methods.submitTs().accountsPartial({
//             user: keypair.publicKey,
//             account: account_key,
//             mint: mintTs.publicKey,
//             collection: mintCollection,
//             mpl_core_program: MPL_CORE_PROGRAM_ID,
//             system_program: SYSTEM_PROGRAM_ID,
//         }).signers([keypair, mintTs]).rpc()
//         console.log(`success! check out your tx here : https://explorer.solana.com/tx/${txhash}?cluster=devnet`)
//     } catch (error) {
//         console.error(`oops, something went wrong : ${error}`);
//     }
// })()