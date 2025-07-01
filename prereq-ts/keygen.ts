import { Keypair } from "@solana/web3.js"

// generating the keypair
let kp = Keypair.generate()
console.log(` ✅ generated new solana wallet :- ${kp.publicKey.toBase58()}`);

console.log(`[${kp.secretKey}]`)




