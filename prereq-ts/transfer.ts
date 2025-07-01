import { clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction } from "@solana/web3.js"
import wallet from "./dev-wallet.json"

const from = Keypair.fromSecretKey(new Uint8Array(wallet));

// turni3 public key
const to = new PublicKey("4HswgCCSreN2yHyCGjRDxQcL8ziiDDuUrVfDWZJV9cAH");

const connection = new Connection(clusterApiUrl("devnet"));

// (async () => {
//     try {
//         const transaction = new Transaction().add(SystemProgram.transfer({
//             fromPubkey: from.publicKey,
//             toPubkey: to,
//             lamports: LAMPORTS_PER_SOL / 10
//         }))

//         transaction.recentBlockhash = (await connection.getLatestBlockhash("confirmed")).blockhash
//         transaction.feePayer = from.publicKey;

//         // sign txn, broadcast and confirm 
//         const singature = await sendAndConfirmTransaction(
//             connection,
//             transaction,
//             [from]
//         )

//         console.log(`Success ! check out your tx here :  https://explorer.solana.com/tx/${singature}?cluster=devnet`)

//     } catch (error) {
//         console.error(`oops something went wrong : ${error}`)
//     }
// })()


// sending all remaining sol
(async () => {
    try {
        // get balance 
        const balance = await connection.getBalance(from.publicKey);
        console.log("balance : ", balance)

        const transaction = new Transaction().add(SystemProgram.transfer({
            fromPubkey: from.publicKey,
            toPubkey: to,
            lamports: balance
        }))

        transaction.recentBlockhash = (await connection.getLatestBlockhash("confirmed")).blockhash
        transaction.feePayer = from.publicKey

        const fee = (await connection.getFeeForMessage(transaction.compileMessage(), "confirmed")).value || 0;
        console.log("fee : ", fee)

        // removing transfer ixn
        transaction.instructions.pop();
        transaction.add(SystemProgram.transfer({
            fromPubkey: from.publicKey,
            toPubkey: to,
            lamports: balance - fee
        }));

        // sign txn
        const singature = await sendAndConfirmTransaction(
            connection, transaction, [from]
        )

        console.log(`success check out your tx here : https://explorer.solana.com/tx/${singature}?cluster=devnet`)

    } catch (error) {
        console.log("some error occured : ", error)
    }
})()