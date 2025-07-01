use solana_sdk::signature::Keypair;
#[cfg(test)]
mod tests {
    use solana_sdk::{
        self,
        blake3::hash,
        client,
        instruction::{ AccountMeta, Instruction },
        message::Message,
        pubkey::Pubkey,
        signature::{ read_keypair_file, Keypair },
        signer::Signer,
        system_instruction::transfer,
        system_program,
        transaction::{ self, Transaction },
    };
    use bs58;
    use std::{ io::{ self, BufRead }, str::FromStr };
    use solana_client::{ nonblocking::rpc_client, rpc_client::RpcClient };

    const RPC_URL: &str =
        "https://turbine-solanad-4cde.devnet.rpcpool.com/9a9da9cf-6db1-47dc-839a-55aca5c9c80a";

    const RPC_URL2: &str = "https://api.devnet.solana.com";

    // #[test]
    fn keygen() {
        // create a new keypair
        let kp = Keypair::new();
        println!("you've generated a new solana wallet : {}", kp.pubkey().to_string());
        println!("");
        println!("To save your wallet , copy and paste the following into a JSON file : ");
        println!("{:?}", kp.to_bytes());
    }

    // #[test]
    fn base58_to_wallet() {
        println!("Input your private key as a base58 string : ");
        let stdin = io::stdin();
        let base58 = stdin.lock().lines().next().unwrap().unwrap();
        println!("Your wallet file format is : ");
        let wallet = bs58::decode(base58).into_vec().unwrap_err();
        println!("{:?}", wallet);
    }

    // #[test]
    fn wallet_to_base58() {
        println!("Input your private key as a JSON byte array (e.g. [12, 23 , ...");
        let stdin = io::stdin();
        let wallet = stdin
            .lock()
            .lines()
            .next()
            .unwrap()
            .unwrap()
            .trim_start_matches("[")
            .trim_end_matches("]")
            .split(',')
            .map(|s| s.trim().parse::<u8>().unwrap())
            .collect::<Vec<u8>>();

        println!("Your base58-encoded private key is : ");
        let base58 = bs58::encode(wallet).into_string();
        println!("{:?}", base58);
    }

    #[test]
    fn airdrop() {
        let keypair = read_keypair_file("dev_wallet.json").expect("couldn't find wallet file");

        let client = RpcClient::new(RPC_URL2);

        match client.request_airdrop(&keypair.pubkey(), 2_000_000_000u64) {
            Ok(sig) => {
                println!("✅ Sucess! check your tx here : ");
                println!("https://explorer.solana.com/tx/{}?cluster=devnet", sig);
            }
            Err(err) => {
                println!("Airdrop failed : {} ", err);
            }
        }
    }

    #[test]
    fn transfer_sol() {
        let keypair = read_keypair_file("dev_wallet.json").expect("Couldn't find wallet file");
        let pubkey = keypair.pubkey();
        println!("Pubke is : ✅ : {}", pubkey);

        let message_bytes = b"| verify my solana keypair!";
        let sig = keypair.sign_message(message_bytes);
        let sig_hashed = hash(sig.as_ref());

        // verify the signature using the public key
        match sig.verify(&pubkey.to_bytes(), &sig_hashed.to_bytes()) {
            true => println!("singature verified"),
            false => println!("verification failed"),
        }

        let to_pubkey = Pubkey::from_str("4HswgCCSreN2yHyCGjRDxQcL8ziiDDuUrVfDWZJV9cAH").unwrap();
        let rpc_client = RpcClient::new(RPC_URL);

        // fetch recent blockchash
        let recent_blockhash = rpc_client
            .get_latest_blockhash()
            .expect("failed to get recent blockchash");

        let transaction = Transaction::new_signed_with_payer(
            &[transfer(&keypair.pubkey(), &to_pubkey, 100_000_000)],
            Some(&keypair.pubkey()),
            &vec![&keypair],
            recent_blockhash
        );

        let signature = rpc_client
            .send_and_confirm_transaction(&transaction)
            .expect("failed to send transaction");
        println!("Success! check out your tx here : https://explorer.solana.com/tx/{}/?cluster=devnet", signature);
    }

    #[test]
    fn empty_wallet() {
        let keypair = read_keypair_file("dev_wallet.json").expect("Couldn't find wallet file");
        let pubkey = keypair.pubkey();
        let to_pubkey = Pubkey::from_str("4HswgCCSreN2yHyCGjRDxQcL8ziiDDuUrVfDWZJV9cAH").unwrap();

        let rpc_client = RpcClient::new(RPC_URL);

        let balance = rpc_client.get_balance(&keypair.pubkey()).expect("failed to get balance");

        let recent_blockhash = rpc_client
            .get_latest_blockhash()
            .expect("failed to get recent blockchash");

        // mock transaction to calculate fees.
        let message = Message::new_with_blockhash(
            &[transfer(&keypair.pubkey(), &to_pubkey, balance)],
            Some(&keypair.pubkey()),
            &recent_blockhash
        );

        let fee = rpc_client.get_fee_for_message(&message).expect("failed to get fee calculator");

        let transaction = Transaction::new_signed_with_payer(
            &[transfer(&keypair.pubkey(), &to_pubkey, balance - fee)],
            Some(&keypair.pubkey()),
            &vec![&keypair],
            recent_blockhash
        );

        // sending transaction with balance minus fee
        let signature = rpc_client
            .send_and_confirm_transaction(&transaction)
            .expect("failed to send final transaction");

        println!("Success! Entire balance transferred: https://explorer.solana.com/tx/{}/?cluster=devnet", signature)
    }

    #[test]
    fn enroll() {
        let rpc_client = RpcClient::new(RPC_URL2);

        let signer = read_keypair_file("turbin3_wallet.json").expect("couldn't find wallet file");

        let mint = Keypair::new();

        let turbin3_prereq_program = Pubkey::from_str(
            "TRBZyQHB3m68FGeVsqTK39Wm4xejadjVhP5MAZaKWDM"
        ).unwrap();

        let collection = Pubkey::from_str("5ebsp5RChCGK7ssRZMVMufgVZhd2kFbNaotcZ5UvytN2").unwrap();

        let mpl_core_program = Pubkey::from_str(
            "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d"
        ).unwrap();

        let system_program = system_program::id();

        let signer_pubkey = signer.pubkey();

        let seeds = &[b"prereqs", signer_pubkey.as_ref()];

        let (prereq_pda, _bump) = Pubkey::find_program_address(seeds, &turbin3_prereq_program);

        let data = vec![77, 124, 82, 163, 21, 133, 181, 206];

        let (authority, _auth_bump) = Pubkey::find_program_address(
            &[b"collection", collection.as_ref()],
            &turbin3_prereq_program
        );

        let accounts = vec![
            AccountMeta::new(signer.pubkey(), true), // user signer
            AccountMeta::new(prereq_pda, false), // PDA account
            AccountMeta::new(mint.pubkey(), true), // mint keypair
            AccountMeta::new(collection, false), // collection
            AccountMeta::new_readonly(authority, false), // authority (PDA)
            AccountMeta::new_readonly(mpl_core_program, false), // mpl core program
            AccountMeta::new_readonly(system_program, false) // system program
        ];

        let blockhash = rpc_client.get_latest_blockhash().expect("failed to get recent blockhash");

        // building the transaction
        let instruction = Instruction {
            program_id: turbin3_prereq_program,
            accounts,
            data,
        };

        let transaction = Transaction::new_signed_with_payer(&[instruction], Some(&signer.pubkey()), &[&signer,&mint], blockhash);

        let signature = rpc_client.send_and_confirm_transaction(&transaction).expect("failed to send the transaction");
        println!("Success check out your tx here :\n https://explorer.solana.com/tx/{}/?cluster=devnet",signature);
    }
}
