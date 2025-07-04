import wallet from "../turbin3-wallet.json"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { createGenericFile, createSignerFromKeypair, signerIdentity } from "@metaplex-foundation/umi"
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys"

// Create a devnet connection
const umi = createUmi('https://api.devnet.solana.com');

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(irysUploader());
umi.use(signerIdentity(signer));

(async () => {
    try {
        // Follow this JSON structure
        // https://docs.metaplex.com/programs/token-metadata/changelog/v1.0#json-structure

        const image = "https://gateway.irys.xyz/7o8HxTDDAtMjX756g7UoWA4oxGb3JzxdbqgkvuaN87qY"
        const metadata = {
            name: "KundPal",
            symbol: "KD",
            description: "most adorable male",
            image: image,
            attributes: [
                { trait_type: 'AURA', value: '-9999999' }
            ],
            properties: {
                files: [
                    {
                        type: "image/png",
                        uri: image
                    },
                ]
            },
            creators: [
                {
                    address: signer.publicKey.toString(),
                    share: 100
                }
            ]
        };
        const metadataFile = createGenericFile(
            Buffer.from(JSON.stringify(metadata)),
            "kundpal.json", { contentType: "application/json" }
        )

        const [metadataUri] = await umi.uploader.upload([metadataFile])

        console.log("✅ Your metadata URI: ", metadataUri);
    }
    catch (error) {
        console.log("Oops.. Something went wrong", error);
    }
})();
