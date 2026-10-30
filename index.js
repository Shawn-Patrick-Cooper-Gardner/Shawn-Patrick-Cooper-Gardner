import { Client, Wallet, dropsToXrp } from 'xrpl';

export const TESTNET_SERVER = 'wss://s.altnet.rippletest.net:51233';
export const MAINNET_SERVER = 'wss://xrplcluster.com';

export async function inspectAccount(address, server = TESTNET_SERVER) {
  const client = new Client(server);
  await client.connect();
  try {
    const response = await client.request({
      command: 'account_info',
      account: address,
      ledger_index: 'validated',
    });
    return response.result.account_data;
  } finally {
    await client.disconnect();
  }
}

async function main() {
  console.log('====================================================');
  console.log('13 AEROSPACE DEFENSE COMPANY // XRPL-PAYMENTS ENGINE');
  console.log('SUPER PROJECT EXCALIBUR // US-1-AUTHORITY');
  console.log('Target Network: XRPL Testnet (wss://s.altnet.rippletest.net:51233)');
  console.log('====================================================\n');

  console.log('Usage:');
  console.log('  npm run wallet:new  -> Generate & fund a new testnet wallet');
  console.log('  npm test            -> Execute test suite with node:test');
  console.log('  npm start           -> Display this status header\n');
}

if (process.argv[1] && process.argv[1].endsWith('index.js')) {
  main().catch(console.error);
}
