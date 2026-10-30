import { Client } from 'xrpl';

async function generateWallet() {
  const client = new Client('wss://s.altnet.rippletest.net:51233');
  await client.connect();

  const fundWallet = await client.fundWallet();
  console.log('--- XRPL TESTNET WALLET CREATED ---');
  console.log('Address:', fundWallet.wallet.address);
  console.log('Seed:', fundWallet.wallet.seed);
  console.log('Balance:', fundWallet.balance, 'XRP');

  await client.disconnect();
}

generateWallet().catch(console.error);
