import { Coinbase, Wallet, ServerSigner } from "@coinbase/coinbase-sdk";

// testing coinbase Managed wallet
let coinbase = Coinbase.configureFromJson({ filePath: "~/Downloads/cdp_api_key.json" });

Coinbase.useServerSigner = true;

let serverSigner = await ServerSigner.getDefault();
console.log("🚀 ~ serverSigner:", serverSigner);

// Create a new wallet using server signer
// let wallet = await Wallet.create({ networkId: Coinbase.networks.BaseSepolia });
// console.log(`Wallet successfully imported: `, wallet.toString());

// Get wallet IDs dynamically from serverSigner
const walletIds = serverSigner.model.wallets;
console.log("Available wallet IDs:", walletIds);

// Re-instantiate existing wallets using their IDs
const wallets = await Promise.all(
  walletIds.map(async id => {
    const wallet = await Wallet.import({
      walletId: id,
      seed: serverSigner.model.server_signer_id, // Using server_signer_id as seed
    });
    console.log(`Re-instantiated wallet ${id}:`, wallet.toString());
    return wallet;
  }),
);

// Use first wallet for faucet and transfer
const wallet1 = wallets[0];
const wallet2 = wallets[1];

// Get faucet for wallet1
console.log("\nRequesting faucet for Wallet 1...");
const faucetTransaction = await wallet1.faucet();
await faucetTransaction.wait();
console.log("Faucet transaction completed:", faucetTransaction.toString());

// Check wallet1 balance after faucet
const wallet1Balance = await wallet1.listBalances();
console.log("Wallet 1 balance after faucet:", wallet1Balance);

// Transfer funds from wallet1 to wallet2
console.log("\nTransferring funds from Wallet 1 to Wallet 2...");
const transfer = await wallet1.createTransfer({
  amount: 0.00001,
  assetId: Coinbase.assets.Eth,
  destination: wallet2,
});

// Wait for transfer to complete
await transfer.wait();

// Check transfer status
if (transfer.getStatus() === "complete") {
  console.log("Transfer completed successfully:", transfer.toString());

  // Check final balances
  const finalWallet1Balance = await wallet1.listBalances();
  const finalWallet2Balance = await wallet2.listBalances();

  console.log("\nFinal balances:");
  console.log("Wallet 1:", finalWallet1Balance);
  console.log("Wallet 2:", finalWallet2Balance);
} else {
  console.error("Transfer failed:", transfer.toString());
}
