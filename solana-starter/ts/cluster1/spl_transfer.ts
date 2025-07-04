import { Commitment, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js"
import wallet from "../turbin3-wallet.json"
import { getOrCreateAssociatedTokenAccount, transfer } from "@solana/spl-token";

// We're going to import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

//Create a Solana devnet connection
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);

// Mint address
const mint = new PublicKey("AQLBNURCQUn89LKkqTLCAUNXi51Pv3xhyVLHH3j2v5AH");

// Recipient address
const to = new PublicKey("4HswgCCSreN2yHyCGjRDxQcL8ziiDDuUrVfDWZJV9cAH");

(async () => {
    try {
        // Get the token account of the fromWallet address, and if it does not exist, create it
        let fromAta = await getOrCreateAssociatedTokenAccount(
            connection,
            keypair,
            mint,
            keypair.publicKey
        )
        // Get the token account of the toWallet address, and if it does not exist, create it
        let toAta = await getOrCreateAssociatedTokenAccount(
            connection,
            keypair,
            mint,
            to
        )

        // Transfer the new token to the "toTokenAccount" we just created
        let tx = await transfer(
            connection,
            keypair,
            fromAta.address,
            toAta.address,
            keypair,
            1e6,
        )
        console.log("✅ txn succeeded : ", tx);
    } catch (e) {
        console.error(`Oops, something went wrong: ${e}`)
    }
})();