import React, { useState, useEffect, useCallback } from 'react';

interface ValidationRule {
  key: string;
  label: string;
  required: boolean;
}

const REQUIRED_SCHEMA_KEYS: ValidationRule[] = [
  { key: 'packageId', label: 'Package Identifier (packageId)', required: true },
  { key: 'granuleId', label: 'Granule Identifier (granuleId)', required: true },
  { key: 'title', label: 'Document Title (title)', required: true },
  { key: 'dateIssued', label: 'Issuance Date (dateIssued)', required: true },
];

const PRESETS = {
  govinfo_granule: JSON.stringify(
    {
      packageId: 'CDIR-2026-01-15',
      granuleId: 'CDIR-2026-01-15-pid123',
      title: 'Official Congressional Directory - 119th Congress',
      dateIssued: '2026-01-15',
      collection: 'CDIR',
      publisher: 'U.S. Government Publishing Office',
      securityClassification: 'PUBLIC DOMAIN / OPEN GOV API',
    },
    null,
    2
  ),
  custom: JSON.stringify(
    {
      packageId: 'CUSTOM-REC-001',
      granuleId: 'GRANULE-99',
      title: 'Sample Manifest Record',
      dateIssued: '2026-10-07',
    },
    null,
    2
  ),
};

export const PayloadValidator: React.FC = () => {
  const [jsonInput, setJsonInput] = useState<string>(PRESETS.govinfo_granule);
  const [parsedData, setParsedData] = useState<Record<string, unknown> | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [sha256Hash, setSha256Hash] = useState<string>('Calculating...');
  const [copied, setCopied] = useState<boolean>(false);

  // Compute SHA-256 Digest using Web Crypto API
  const computeHash = useCallback(async (content: string) => {
    try {
      const msgBuffer = new TextEncoder().encode(content);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      setSha256Hash(hashHex);
    } catch (err) {
      setSha256Hash('Error computing hash');
    }
  }, []);

  // Parse JSON and trigger hash calculation on input change
  useEffect(() => {
    computeHash(jsonInput);
    try {
      const parsed = JSON.parse(jsonInput);
      setParsedData(parsed);
      setParseError(null);
    } catch (err: unknown) {
      setParsedData(null);
      setParseError((err as Error).message);
    }
  }, [jsonInput, computeHash]);

  const handleCopyHash = () => {
    navigator.clipboard.writeText(sha256Hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(parsed, null, 2));
    } catch (err) {
      // Keep invalid input as is
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 font-mono text-gray-200 selection:bg-cyan-500 selection:text-black">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="border-b border-gray-800 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-wider text-cyan-400">
              PUBLIC DOCUMENT & PAYLOAD INTEGRITY VALIDATOR
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Client-side Web Crypto SHA-256 hashing and GovInfo schema conformance inspection engine.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setJsonInput(PRESETS.govinfo_granule)}
              className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-cyan-300 border border-gray-700 rounded transition cursor-pointer"
            >
              Load GovInfo Preset
            </button>
            <button
              onClick={() => setJsonInput(PRESETS.custom)}
              className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-cyan-300 border border-gray-700 rounded transition cursor-pointer"
            >
              Load Custom Preset
            </button>
            <button
              onClick={formatJson}
              className="px-3 py-1.5 text-xs bg-cyan-950 hover:bg-cyan-900 text-cyan-200 border border-cyan-800 rounded transition cursor-pointer"
            >
              Beautify JSON
            </button>
          </div>
        </div>

        {/* Main Grid Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Left Column: JSON Source Editor */}
          <div className="flex flex-col bg-[#111622] border border-gray-800 rounded-lg p-4 shadow-xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-gray-400 tracking-wider">
                SOURCE PAYLOAD EDITOR
              </span>
              <span className="text-xs text-gray-500">
                {new TextEncoder().encode(jsonInput).length} bytes
              </span>
            </div>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder="Paste JSON payload here..."
              className="w-full h-96 bg-[#0B0F17] text-cyan-300 text-xs p-3 rounded border border-gray-800 focus:outline-none focus:border-cyan-500 resize-none font-mono"
              spellCheck={false}
            />
            {parseError && (
              <div className="mt-2 p-2 bg-red-950/50 border border-red-800 text-red-400 text-xs rounded">
                JSON Parse Error: {parseError}
              </div>
            )}
          </div>

          {/* Right Column: Integrity Audit & Conformance Panel */}
          <div className="flex flex-col space-y-6">
            {/* SHA-256 Integrity Card */}
            <div className="bg-[#111622] border border-gray-800 rounded-lg p-4 shadow-xl">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-gray-400 tracking-wider">
                  CRYPTOGRAPHIC SHA-256 DIGEST
                </span>
                <button
                  onClick={handleCopyHash}
                  className="text-xs text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {copied ? '[ COPIED ]' : '[ COPY HASH ]'}
                </button>
              </div>
              <div className="bg-[#0B0F17] p-3 rounded border border-gray-800 text-cyan-400 text-xs break-all">
                {sha256Hash}
              </div>
            </div>

            {/* Schema Conformance Checklist */}
            <div className="bg-[#111622] border border-gray-800 rounded-lg p-4 shadow-xl flex-1">
              <span className="text-xs font-semibold text-gray-400 tracking-wider block mb-3">
                SCHEMA CONFORMANCE AUDIT
              </span>
              <div className="space-y-2">
                {REQUIRED_SCHEMA_KEYS.map((rule) => {
                  const exists = parsedData && parsedData[rule.key] !== undefined;
                  return (
                    <div
                      key={rule.key}
                      className="flex items-center justify-between p-2 bg-[#0B0F17] rounded border border-gray-800 text-xs"
                    >
                      <span className="text-gray-300">{rule.label}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          exists
                            ? 'bg-green-950 text-green-400 border border-green-800'
                            : 'bg-red-950 text-red-400 border border-red-800'
                        }`}
                      >
                        {exists ? 'PASS' : 'MISSING'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Formatted JSON Tree View */}
        <div className="bg-[#111622] border border-gray-800 rounded-lg p-4 shadow-xl">
          <span className="text-xs font-semibold text-gray-400 tracking-wider block mb-2">
            PARSED METADATA SCHEMA READOUT
          </span>
          <pre className="bg-[#0B0F17] p-4 rounded border border-gray-800 text-cyan-300 text-xs overflow-x-auto max-h-64">
            {parsedData
              ? JSON.stringify(parsedData, null, 2)
              : 'Invalid JSON - awaiting correct payload structure...'}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default PayloadValidator;
