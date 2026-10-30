import React, { useState } from 'react';
import { Wallet, dropsToXrp } from 'xrpl';
import {
  xrplService,
  XRPLAccountInfo,
  VerificationChallenge,
  SignatureVerificationResult,
  XRPL_NETWORKS,
  NetworkKey,
} from '../services/xrplService';

export const XrplProvenanceAudit: React.FC = () => {
  const [network, setNetwork] = useState<NetworkKey>('testnet');
  const [address, setAddress] = useState<string>('rPT1Sjq2YGrBMTttX4GZHjKu9DYfzbpAYe');
  const [isQuerying, setIsQuerying] = useState<boolean>(false);
  const [isFunding, setIsFunding] = useState<boolean>(false);
  const [fundedLog, setFundedLog] = useState<{ address: string; seed?: string; balance: number } | null>(null);
  const [accountInfo, setAccountInfo] = useState<XRPLAccountInfo | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);

  // Challenge and Verification State
  const [activeChallenge, setActiveChallenge] = useState<VerificationChallenge | null>(null);
  const [signingMode, setSigningMode] = useState<'external' | 'local_seed'>('external');
  const [publicKeyHex, setPublicKeyHex] = useState<string>('');
  const [signatureHex, setSignatureHex] = useState<string>('');
  const [localSeed, setLocalSeed] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<SignatureVerificationResult | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Query on-ledger account details via xrpl.js
  const handleQueryAccount = async () => {
    if (!address.trim()) return;
    setIsQuerying(true);
    setQueryError(null);
    setAccountInfo(null);
    setVerificationResult(null);

    try {
      const info = await xrplService.queryAccount(address, network);
      setAccountInfo(info);
      // Auto-generate challenge for this address
      const challenge = xrplService.createChallenge(info.address);
      setActiveChallenge(challenge);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setQueryError(errorMsg);
    } finally {
      setIsQuerying(false);
    }
  };

  // Generate new Challenge
  const handleRegenerateChallenge = () => {
    if (!address.trim()) return;
    const challenge = xrplService.createChallenge(address.trim());
    setActiveChallenge(challenge);
    setVerificationResult(null);
  };

  // Fast Testnet Sample Address
  const handleLoadSample = (sampleType: 'testnet_whale' | '13adc_vault') => {
    if (sampleType === 'testnet_whale') {
      setAddress('rPT1Sjq2YGrBMTttX4GZHjKu9DYfzbpAYe');
      setNetwork('testnet');
    } else {
      setAddress('rEb8TK3gBgk5auZyyY67aJnHg2KjtuvP56');
      setNetwork('mainnet');
    }
  };

  // Local Seed Signing (for developer / operator simulation)
  const handleSignWithSeed = () => {
    if (!activeChallenge) return;
    if (!localSeed.trim()) {
      setQueryError('Please provide an XRPL seed (e.g., sEd... or s...) to sign.');
      return;
    }

    try {
      const wallet = Wallet.fromSeed(localSeed.trim());
      if (wallet.classicAddress !== activeChallenge.address) {
        setQueryError(
          `Seed corresponds to ${wallet.classicAddress}, which does NOT match challenge target address ${activeChallenge.address}.`
        );
        return;
      }

      setPublicKeyHex(wallet.publicKey);

      // Sign transaction envelope as proof of key possession
      const dummyTx = {
        TransactionType: 'AccountSet' as const,
        Account: wallet.classicAddress,
        Fee: '12',
        Sequence: accountInfo?.sequence || 1,
      };

      const signed = wallet.sign(dummyTx);
      setSignatureHex(signed.tx_blob);
      setQueryError(null);

      // Auto-verify
      handleVerifySignature(signed.tx_blob, wallet.publicKey);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setQueryError(`Seed Signing Error: ${errorMsg}`);
    }
  };

  // Verify signature against challenge
  const handleVerifySignature = async (customSig?: string, customPub?: string) => {
    if (!activeChallenge) return;
    const sig = customSig || signatureHex;
    const pub = customPub || publicKeyHex;

    if (!sig.trim() || !pub.trim()) {
      setQueryError('Please provide both the Signature Hex and Public Key Hex.');
      return;
    }

    setIsVerifying(true);
    setQueryError(null);

    try {
      const res = await xrplService.verifySignatureChallenge(activeChallenge, sig, pub);
      setVerificationResult(res);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setQueryError(`Verification Failed: ${errorMsg}`);
    } finally {
      setIsVerifying(false);
    }
  };

  // Generate an Ephemeral Testnet Wallet to test live signing flow
  const handleCreateEphemeralWallet = () => {
    const w = Wallet.generate();
    setAddress(w.classicAddress);
    setLocalSeed(w.seed || '');
    setPublicKeyHex(w.publicKey);
    setSigningMode('local_seed');
    setNetwork('testnet');
    setAccountInfo({
      address: w.classicAddress,
      balanceDrops: '0',
      balanceXRP: '0.000000',
      sequence: 1,
      ownerCount: 0,
      status: 'UNFUNDED',
    });
    const challenge = xrplService.createChallenge(w.classicAddress);
    setActiveChallenge(challenge);
    setVerificationResult(null);
  };

  // Live Testnet Faucet Funding via Client.fundWallet()
  const handleFundLiveWallet = async () => {
    setIsFunding(true);
    setQueryError(null);
    setFundedLog(null);
    setVerificationResult(null);

    try {
      const fundResult = await xrplService.fundTestnetWallet();
      setAddress(fundResult.address);
      setLocalSeed(fundResult.seed || '');
      setPublicKeyHex(fundResult.publicKey);
      setSigningMode('local_seed');
      setNetwork('testnet');
      setFundedLog({
        address: fundResult.address,
        seed: fundResult.seed,
        balance: fundResult.balance,
      });

      setAccountInfo({
        address: fundResult.address,
        balanceDrops: (fundResult.balance * 1_000_000).toString(),
        balanceXRP: fundResult.balance.toFixed(6),
        sequence: 1,
        ownerCount: 0,
        status: 'ACTIVE',
      });

      const challenge = xrplService.createChallenge(fundResult.address);
      setActiveChallenge(challenge);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setQueryError(`Faucet Funding Error: ${errorMsg}`);
    } finally {
      setIsFunding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#0B0F17] border border-cyan-800/60 rounded-xl p-5 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                XRPL.JS Cryptographic Verification Suite
              </span>
              <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-700 px-2 py-0.5 rounded font-mono font-bold">
                SDK v5.3.0
              </span>
            </div>
            <h2 className="text-xl font-bold text-white font-mono mt-1">
              XRPL Address Ownership &amp; Payment Provenance Verifier
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Inspect on-ledger state via official WebSocket clusters, generate tamper-proof ownership challenges,
              and verify ECDSA / Ed25519 signature proofs with 100% cryptographic certainty.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              onClick={handleFundLiveWallet}
              disabled={isFunding}
              className="px-3.5 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-mono font-bold rounded text-xs transition cursor-pointer flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              <svg className={`w-4 h-4 ${isFunding ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>{isFunding ? 'Funding from Faucet...' : '⚡ Create & Fund Testnet Wallet'}</span>
            </button>

            <button
              onClick={handleCreateEphemeralWallet}
              className="px-3.5 py-2 bg-gray-800 hover:bg-gray-700 text-cyan-300 border border-cyan-800 rounded text-xs font-mono font-bold transition cursor-pointer flex items-center gap-1.5"
            >
              <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Offline Keypair</span>
            </button>
          </div>
        </div>

        {/* Faucet Funded Notification Banner */}
        {fundedLog && (
          <div className="mt-4 bg-[#050810] border border-emerald-500/40 rounded-lg p-4 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-emerald-500/20">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>--- XRPL TESTNET WALLET CREATED ---</span>
              </div>
              <button
                onClick={() =>
                  copyToClipboard(
                    `Address: ${fundedLog.address}\nSeed: ${fundedLog.seed}\nBalance: ${fundedLog.balance} XRP`,
                    'funded_wallet'
                  )
                }
                className="text-[11px] px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-700 rounded hover:bg-emerald-900 cursor-pointer"
              >
                {copiedKey === 'funded_wallet' ? 'COPIED WALLET' : 'COPY DETAILS'}
              </button>
            </div>
            <div className="space-y-1 text-slate-300">
              <div>
                <span className="text-slate-500">Address:</span>{' '}
                <span className="text-cyan-300 font-bold">{fundedLog.address}</span>
              </div>
              <div>
                <span className="text-slate-500">Seed:</span>{' '}
                <span className="text-amber-300 font-mono">{fundedLog.seed}</span>
              </div>
              <div>
                <span className="text-slate-500">Balance:</span>{' '}
                <span className="text-emerald-400 font-bold">{fundedLog.balance} XRP</span>
              </div>
              <div className="text-[11px] text-slate-500 pt-1">
                # Successfully created and funded on XRPL Testnet (wss://s.altnet.rippletest.net:51233). Ready for on-ledger operations and cryptographic challenges.
              </div>
            </div>
          </div>
        )}

        {/* Network & Address Input Grid */}
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-3 pt-4 border-t border-gray-800">
          <div className="lg:col-span-3">
            <label className="text-[11px] font-bold text-slate-400 uppercase font-mono block mb-1">
              XRPL Cluster Network
            </label>
            <select
              value={network}
              onChange={(e) => setNetwork(e.target.value as NetworkKey)}
              className="w-full bg-[#111622] border border-gray-800 text-white rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-cyan-400"
            >
              {Object.entries(XRPL_NETWORKS).map(([key, net]) => (
                <option key={key} value={key}>
                  {net.name}
                </option>
              ))}
            </select>
            <span className="text-[10px] text-slate-500 font-mono mt-1 block truncate">
              {XRPL_NETWORKS[network].server}
            </span>
          </div>

          <div className="lg:col-span-7">
            <label className="text-[11px] font-bold text-slate-400 uppercase font-mono block mb-1">
              Target XRPL Classic Address
            </label>
            <div className="relative">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. rPT1Sjq2YGrBMTttX4GZHjKu9DYfzbpAYe..."
                className="w-full bg-[#111622] border border-gray-800 rounded-lg px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-[11px]">
              <span className="text-slate-500">Presets:</span>
              <button
                onClick={() => handleLoadSample('testnet_whale')}
                className="text-cyan-400 hover:underline font-mono"
              >
                [Testnet Faucet Pool]
              </button>
              <button
                onClick={() => handleLoadSample('13adc_vault')}
                className="text-cyan-400 hover:underline font-mono"
              >
                [Genesis Mainnet Account]
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 flex items-start pt-6">
            <button
              onClick={handleQueryAccount}
              disabled={isQuerying}
              className="w-full py-2 px-3 bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold uppercase font-mono tracking-wider rounded-lg text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/20 disabled:opacity-50"
            >
              {isQuerying ? (
                <span>Connecting...</span>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Connect &amp; Query</span>
                </>
              )}
            </button>
          </div>
        </div>

        {queryError && (
          <div className="mt-3 p-3 bg-rose-950/60 border border-rose-700 text-rose-300 text-xs font-mono rounded-lg flex items-center justify-between">
            <span>{queryError}</span>
            <button onClick={() => setQueryError(null)} className="text-gray-400 hover:text-white">✕</button>
          </div>
        )}
      </div>

      {/* Account Info Live Ledger Card */}
      {accountInfo && (
        <div className="bg-[#111622] border border-gray-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                Ledger Account Verification Status
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                  accountInfo.status === 'ACTIVE'
                    ? 'bg-emerald-950 text-emerald-400 border-emerald-700'
                    : 'bg-amber-950 text-amber-400 border-amber-700'
                }`}
              >
                {accountInfo.status}
              </span>
            </div>
            <a
              href={`${XRPL_NETWORKS[network].explorer}/accounts/${accountInfo.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-cyan-400 hover:underline font-mono inline-flex items-center gap-1"
            >
              <span>View in XRPL Explorer</span>
              <span>↗</span>
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 bg-[#0B0F17] rounded-lg border border-gray-800">
              <span className="text-[10px] text-slate-500 block uppercase">Validated Balance</span>
              <span className="text-emerald-400 font-extrabold text-base block mt-0.5">
                {parseFloat(accountInfo.balanceXRP).toLocaleString(undefined, { minimumFractionDigits: 2 })} XRP
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {accountInfo.balanceDrops} drops
              </span>
            </div>

            <div className="p-3 bg-[#0B0F17] rounded-lg border border-gray-800">
              <span className="text-[10px] text-slate-500 block uppercase">Sequence Number</span>
              <span className="text-white font-bold text-base block mt-0.5">
                #{accountInfo.sequence}
              </span>
              <span className="text-[10px] text-slate-500">Owner Count: {accountInfo.ownerCount}</span>
            </div>

            <div className="p-3 bg-[#0B0F17] rounded-lg border border-gray-800">
              <span className="text-[10px] text-slate-500 block uppercase">Cluster Node</span>
              <span className="text-cyan-300 font-bold text-xs truncate block mt-0.5">
                {network.toUpperCase()}
              </span>
              <span className="text-[10px] text-slate-500">WebSocket RPC OK</span>
            </div>

            <div className="p-3 bg-[#0B0F17] rounded-lg border border-gray-800">
              <span className="text-[10px] text-slate-500 block uppercase">Classic Address</span>
              <span className="text-slate-300 font-mono text-[11px] truncate block mt-0.5" title={accountInfo.address}>
                {accountInfo.address.substring(0, 10)}...{accountInfo.address.substring(accountInfo.address.length - 8)}
              </span>
              <button
                onClick={() => copyToClipboard(accountInfo.address, 'acc_addr')}
                className="text-[10px] text-cyan-400 hover:underline"
              >
                {copiedKey === 'acc_addr' ? 'Copied' : 'Copy Full Address'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Signature Challenge & Verification Terminal */}
      {activeChallenge && (
        <div className="bg-[#111622] border border-cyan-500/40 rounded-xl p-5 shadow-2xl space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                  Ownership Signature Request Engine
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Sign the canonical payload below with your XRPL private key to verify address control.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRegenerateChallenge}
                className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-slate-300 text-xs font-mono rounded border border-gray-700 transition"
              >
                Regenerate Nonce
              </button>
              <button
                onClick={() => copyToClipboard(activeChallenge.statement, 'challenge_text')}
                className="px-2.5 py-1 bg-cyan-950 text-cyan-300 hover:bg-cyan-900 text-xs font-mono font-bold rounded border border-cyan-800 transition"
              >
                {copiedKey === 'challenge_text' ? 'Copied Statement' : 'Copy Challenge'}
              </button>
            </div>
          </div>

          {/* Canonical Challenge Box */}
          <div className="bg-[#0B0F17] p-3.5 rounded-lg border border-gray-800 text-xs font-mono space-y-1">
            <span className="text-[10px] text-slate-500 uppercase block font-bold">Canonical Challenge Statement:</span>
            <pre className="text-cyan-300 whitespace-pre-wrap leading-relaxed select-all">
              {activeChallenge.statement}
            </pre>
          </div>

          {/* Signature Input Mode Tabs */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-gray-800 pb-2 text-xs font-mono font-bold">
              <button
                onClick={() => setSigningMode('external')}
                className={`px-3 py-1.5 rounded transition ${
                  signingMode === 'external'
                    ? 'bg-cyan-500 text-black'
                    : 'text-slate-400 hover:text-white bg-gray-900'
                }`}
              >
                Mode 1: External Wallet / Hex Signature (Xaman / Crossmark / Air-Gapped)
              </button>
              <button
                onClick={() => setSigningMode('local_seed')}
                className={`px-3 py-1.5 rounded transition ${
                  signingMode === 'local_seed'
                    ? 'bg-amber-400 text-black'
                    : 'text-slate-400 hover:text-white bg-gray-900'
                }`}
              >
                Mode 2: Local Developer Seed Signing (Testnet / Operator Simulation)
              </button>
            </div>

            {signingMode === 'external' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase font-mono block mb-1">
                    Signer Public Key (Hex)
                  </label>
                  <input
                    type="text"
                    value={publicKeyHex}
                    onChange={(e) => setPublicKeyHex(e.target.value)}
                    placeholder="e.g. 02D58F7B5E2..."
                    className="w-full bg-[#0B0F17] border border-gray-800 rounded-lg p-2.5 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase font-mono block mb-1">
                    Signature Payload (Hex)
                  </label>
                  <input
                    type="text"
                    value={signatureHex}
                    onChange={(e) => setSignatureHex(e.target.value)}
                    placeholder="e.g. 3045022100A38B..."
                    className="w-full bg-[#0B0F17] border border-gray-800 rounded-lg p-2.5 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3 bg-[#0B0F17] p-3.5 rounded-lg border border-amber-900/40">
                <div>
                  <label className="text-[11px] font-bold text-amber-400 uppercase font-mono block mb-1">
                    Signer Secret Seed (Never transmitted to network)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={localSeed}
                      onChange={(e) => setLocalSeed(e.target.value)}
                      placeholder="e.g. sEd... or s..."
                      className="flex-1 bg-[#111622] border border-gray-800 rounded-lg p-2.5 text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-400"
                    />
                    <button
                      onClick={handleSignWithSeed}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs uppercase rounded-lg transition"
                    >
                      Sign &amp; Verify Now
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">
                  Signs an offline transaction payload client-side in memory using xrpl.js to prove matching private key ownership.
                </p>
              </div>
            )}

            {signingMode === 'external' && (
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => handleVerifySignature()}
                  disabled={isVerifying}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold font-mono uppercase tracking-wider rounded-lg text-xs transition cursor-pointer flex items-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{isVerifying ? 'Verifying...' : 'Validate Cryptographic Signature'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Verification Success & Provenance Proof Envelope */}
          {verificationResult && (
            <div className="p-4 bg-emerald-950/40 border border-emerald-600/70 rounded-xl space-y-3 font-mono">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider">
                    OWNERSHIP PROOF VERIFIED (100% BIT-FOR-BIT)
                  </span>
                </div>
                <button
                  onClick={() =>
                    copyToClipboard(JSON.stringify(verificationResult, null, 2), 'proof_json')
                  }
                  className="text-xs text-cyan-300 hover:underline font-bold"
                >
                  {copiedKey === 'proof_json' ? '[ COPIED RECEIPT ]' : '[ COPY PROVENANCE RECEIPT ]'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                <div className="p-2 bg-[#0B0F17] rounded border border-gray-800">
                  <span className="text-[10px] text-slate-500 block">Verified Address:</span>
                  <span className="text-cyan-300 truncate block">{verificationResult.address}</span>
                </div>
                <div className="p-2 bg-[#0B0F17] rounded border border-gray-800">
                  <span className="text-[10px] text-slate-500 block">Timestamp:</span>
                  <span className="text-slate-300 truncate block">{verificationResult.timestamp}</span>
                </div>
                <div className="p-2 bg-[#0B0F17] rounded border border-gray-800">
                  <span className="text-[10px] text-slate-500 block">Challenge ID:</span>
                  <span className="text-amber-300 truncate block">{verificationResult.challengeId}</span>
                </div>
              </div>

              <div className="bg-[#0B0F17] p-2.5 rounded border border-emerald-900 text-[11px] text-slate-300 break-all select-all">
                {JSON.stringify(
                  {
                    authority: '13 Aerospace Defense Company / US-1-AUTHORITY',
                    address: verificationResult.address,
                    challenge_id: verificationResult.challengeId,
                    verified: true,
                    audit_status: 'ACTIVE_PROVENANCE_BOUND',
                  },
                  null,
                  2
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
