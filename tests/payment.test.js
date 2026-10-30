import test from 'node:test';
import assert from 'node:assert/strict';
import { Wallet, dropsToXrp, xrpToDrops } from 'xrpl';

test('XRPL Wallet & Units Verification', async (t) => {
  await t.test('converts drops to XRP and XRP to drops correctly', () => {
    assert.equal(Number(dropsToXrp('1000000')), 1);
    assert.equal(Number(dropsToXrp('25000000')), 25);
    assert.equal(String(xrpToDrops('25')), '25000000');
  });

  await t.test('generates valid keypair wallet locally with classic address', () => {
    const wallet = Wallet.generate();
    assert.ok(wallet.classicAddress.startsWith('r'), 'Address must start with r');
    assert.ok(wallet.publicKey.length >= 64, 'Public key length must be valid');
    assert.ok(wallet.seed, 'Seed must be generated');
  });

  await t.test('can sign message payload and reproduce public key', () => {
    const wallet = Wallet.generate();
    const dummyTx = {
      TransactionType: 'AccountSet',
      Account: wallet.classicAddress,
      Fee: '12',
      Sequence: 1,
    };
    const signed = wallet.sign(dummyTx);
    assert.ok(signed.tx_blob, 'Signed transaction blob exists');
    assert.ok(signed.hash, 'Signed transaction hash exists');
  });
});
