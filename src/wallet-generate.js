import { Client } from 'xrpl';
import fs from 'node:fs';
import path from 'node:path';

async function generateWallet() {
  const client = new Client('wss://s.altnet.rippletest.net:51233');
  await client.connect();

  const fundWallet = await client.fundWallet();
  console.log('--- XRPL TESTNET WALLET CREATED ---');
  console.log('Address:', fundWallet.wallet.address);
  console.log('Seed:', fundWallet.wallet.seed);
  console.log('Balance:', fundWallet.balance, 'XRP');

  // Record evidence artifact into evidence/ directory
  const evidenceDir = path.resolve('evidence');
  if (!fs.existsSync(evidenceDir)) {
    fs.mkdirSync(evidenceDir, { recursive: true });
  }

  const record = {
    event: 'XRPL_TESTNET_GENESIS',
    authority: 'US-1-AUTHORITY',
    entity: '13 Aerospace Defense Company',
    project: 'Super Project EXCALIBUR',
    timestamp: new Date().toISOString(),
    network: 'wss://s.altnet.rippletest.net:51233',
    wallet: {
      classicAddress: fundWallet.wallet.address,
      publicKey: fundWallet.wallet.publicKey,
      seed: fundWallet.wallet.seed,
      initialBalanceDrops: fundWallet.balance ? (Number(fundWallet.balance) * 1000000).toString() : '100000000',
      initialBalanceXRP: fundWallet.balance,
    },
    verification_status: 'FAUCET_FUNDED_AND_CONFIRMED'
  };

  const genesisPath = path.join(evidenceDir, 'wallet-genesis.json');
  const latestPath = path.join(evidenceDir, 'latest-wallet.json');

  fs.writeFileSync(genesisPath, JSON.stringify(record, null, 2), 'utf8');
  fs.writeFileSync(latestPath, JSON.stringify(record, null, 2), 'utf8');
  console.log(`[Evidence] Logged genesis artifact to ${genesisPath}`);

  await client.disconnect();
}

generateWallet().catch(console.error);
