import { Coinbase, Wallet } from "@coinbase/coinbase-sdk";

const sdk_key = {
  id: "5026fb51-8249-451c-8e94-c3c149352725",
  privateKey:
    "/Ci23vjGFTxqDnYE6rg8Es9eG/N+KHU0O3nJ5KUVqAQ8KC6NCFVF4cR1jkS4OoXI5Rw/mSKc2/rsNJGU5PoJWg==",
};

const apiKeyName = sdk_key.id;
const apiKeyPrivateKey = sdk_key.privateKey;

// Coinbase.configure(apiKeyName, apiKeyPrivateKey);

let coinbase = Coinbase.configureFromJson({ filePath: "~/Downloads/cdp_api_key.json" });

console.log("\n --------------------------------------- \n");

// Create a new Wallet
// let wallet = await Wallet.create();

// console.log(`Wallet successfully created: `, wallet.toString());

// Wallets are not saved locally by default. Refer to the Wallets concept for more information.

// Import your Wallet into CDP using your BIP-39 mnemonic seed phrase
const mnemonicPhrase =
  "outdoor book dirt vendor grow trouble small gadget prize shrimp typical marriage";
let wallet = await Wallet.import({ mnemonicPhrase });
console.log(`Wallet successfully imported: `, wallet.toString());

let address = await wallet.getDefaultAddress();
console.log(`Default address for the wallet: `, address.toString());

/*
 * WalletAddress
 * {
 *  addressId: '0xA5dB6b0A601305eF8aa9edeF3006b3c8F683C63F',
 *  networkId: 'base-sepolia',
 *  walletId: '1063ca80-5198-457c-9e3c-7d591d5000e1'
 * }
 */

const faucetTransaction = await wallet.faucet();

// Wait for transaction to land on-chain
await faucetTransaction.wait();

console.log(`Faucet transaction completed successfully: `, faucetTransaction.toString());

let anotherWallet = await Wallet.create();
console.log(`Second Wallet successfully created: `, anotherWallet.toString());

const transfer = await wallet.createTransfer({
  amount: 0.00001,
  assetId: Coinbase.assets.Eth,
  destination: anotherWallet,
});

// Wait for the transfer to settle.
await transfer.wait();

// Check if the transfer successfully completed on-chain.
if (transfer.getStatus() === "complete") {
  console.log(`Transfer successfully completed: `, transfer.toString());
} else {
  console.error("Transfer failed on-chain: ", transfer.toString());
}
