import { Client } from 'xrpl';

async function checkAccount() {
  const client = new Client('wss://s.altnet.rippletest.net:51233');
  await client.connect();

  try {
    const info = await client.request({
      command: 'account_info',
      account: 'rDWZcFbBfQkySPR184EcLQGjP4buPy11An',
      ledger_index: 'validated'
    });
    console.log('Account Balance:', info.result.account_data.Balance / 1_000_000, 'XRP');
  } catch (error) {
    console.log('Account status note:', error.data?.error_message || error.message);
  }

  await client.disconnect();
}

checkAccount().catch(console.error);
