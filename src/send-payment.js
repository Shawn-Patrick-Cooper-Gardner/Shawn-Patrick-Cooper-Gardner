import { Client, Wallet, xrpToDrops } from 'xrpl';

async function sendPayment() {
  const client = new Client('wss://s.altnet.rippletest.net:51233');
  await client.connect();
  console.log('Connected to XRPL Testnet cluster...');

  // EXCALIBUR Testnet Operational Wallet
  const seed = 'sEdVLzE8qn5AKdJxW7uxQbVH3ux1yXf';
  const wallet = Wallet.fromSeed(seed);
  console.log('Loaded Wallet Address:', wallet.address);

  // Destination address (using test faucet or destination pointer)
  const destination = 'rDWZcFbBfQkySPR184EcLQGjP4buPy11An';
  const amountXrp = '10';

  console.log(`Preparing payment of ${amountXrp} XRP to ${destination}...`);

  const prepared = await client.autofill({
    TransactionType: 'Payment',
    Account: wallet.address,
    Destination: destination,
    Amount: xrpToDrops(amountXrp)
  });

  const signed = wallet.sign(prepared);
  console.log('Submitting transaction to ledger...');

  const result = await client.submitAndWait(signed.tx_blob);
  console.log('----------------------------------------');
  console.log('--- TRANSACTION SUCCESSFUL ---');
  console.log('Hash:', result.result.hash);
  console.log('Ledger Index:', result.result.ledger_index);
  console.log('----------------------------------------');

  await client.disconnect();
}

sendPayment().catch(console.error);
