import { clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import wallet from "./dev-wallet.json"

const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));
console.log("wallet public key : ", keypair.publicKey);

const connection = new Connection(clusterApiUrl("devnet"));

(async () => {
    try {
        // claiming 2 devnet sol tokens
        const txhash = await connection.requestAirdrop(keypair.publicKey, 2 * LAMPORTS_PER_SOL);

        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
        await connection.confirmTransaction(
            { signature: txhash, blockhash, lastValidBlockHeight },
            "confirmed"
        );

        console.log(`Success ! check out your tx here : https://explorer.solana.com/tx/${txhash}?cluster=devnet`)
    } catch (error) {
        console.error(`oops something went wrong : ${error}`)
    }
})()


