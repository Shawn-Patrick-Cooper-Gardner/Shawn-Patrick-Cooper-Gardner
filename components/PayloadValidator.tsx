import React, { useState, useEffect, useCallback, useMemo } from 'react';

type FieldType = 'string' | 'number' | 'boolean' | 'object' | 'array';

interface FieldRule {
  key: string;
  label: string;
  required: boolean;
  expectedType: FieldType;
  description: string;
  formatCheck?: (val: unknown) => { valid: boolean; reason?: string };
}

interface SchemaDefinition {
  id: string;
  name: string;
  description: string;
  defaultPayload: Record<string, unknown>;
  rules: FieldRule[];
}

const SCHEMAS: SchemaDefinition[] = [
  {
    id: 'govinfo_granule',
    name: 'GovInfo Granule Summary',
    description: 'U.S. Government Publishing Office package & granule API metadata structure.',
    defaultPayload: {
      packageId: 'CDIR-2026-01-15',
      granuleId: 'CDIR-2026-01-15-pid123',
      title: 'Official Congressional Directory - 119th Congress',
      dateIssued: '2026-01-15',
      collection: 'CDIR',
      publisher: 'U.S. Government Publishing Office',
      securityClassification: 'PUBLIC DOMAIN / OPEN GOV API',
    },
    rules: [
      {
        key: 'packageId',
        label: 'Package Identifier (packageId)',
        required: true,
        expectedType: 'string',
        description: 'Standard collection and date package code (e.g. CDIR-2026-01-15).',
        formatCheck: (val) => ({
          valid: typeof val === 'string' && val.trim().length > 3,
          reason: 'Must be a non-empty string identifier (min 4 chars).',
        }),
      },
      {
        key: 'granuleId',
        label: 'Granule Identifier (granuleId)',
        required: true,
        expectedType: 'string',
        description: 'Specific granule child ID within the package.',
        formatCheck: (val) => ({
          valid: typeof val === 'string' && val.trim().length > 3,
          reason: 'Must be a non-empty granule string identifier.',
        }),
      },
      {
        key: 'title',
        label: 'Document Title (title)',
        required: true,
        expectedType: 'string',
        description: 'Official document title.',
        formatCheck: (val) => ({
          valid: typeof val === 'string' && val.trim().length >= 3,
          reason: 'Title must be at least 3 characters.',
        }),
      },
      {
        key: 'dateIssued',
        label: 'Issuance Date (dateIssued)',
        required: true,
        expectedType: 'string',
        description: 'ISO 8601 calendar date format (YYYY-MM-DD).',
        formatCheck: (val) => {
          if (typeof val !== 'string') return { valid: false, reason: 'Must be an ISO string date.' };
          const isValidIso = /^\d{4}-\d{2}-\d{2}$/.test(val) && !isNaN(Date.parse(val));
          return { valid: isValidIso, reason: 'Expected ISO date format YYYY-MM-DD (e.g. 2026-01-15).' };
        },
      },
      {
        key: 'collection',
        label: 'Collection Code (collection)',
        required: false,
        expectedType: 'string',
        description: 'GovInfo collection shorthand identifier (e.g. CDIR, FR, BILLS, USCODE).',
      },
      {
        key: 'publisher',
        label: 'Publisher (publisher)',
        required: false,
        expectedType: 'string',
        description: 'Publishing authority or institution.',
      },
    ],
  },
  {
    id: 'geojson_feature',
    name: 'GeoJSON Feature Placemark',
    description: 'Cartographic geospatial feature geometry and properties schema.',
    defaultPayload: {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-114.8344942, 35.9782266],
      },
      properties: {
        name: 'Boulder City Reference 89005',
        datum: 'WGS 84',
        elevation_meters: 765,
      },
    },
    rules: [
      {
        key: 'type',
        label: 'Feature Type (type)',
        required: true,
        expectedType: 'string',
        description: 'Must equal literal value "Feature".',
        formatCheck: (val) => ({
          valid: val === 'Feature',
          reason: 'GeoJSON root type must be "Feature".',
        }),
      },
      {
        key: 'geometry',
        label: 'Geometry Object (geometry)',
        required: true,
        expectedType: 'object',
        description: 'Must be an object with geometry type and coordinates array.',
        formatCheck: (val) => {
          if (!val || typeof val !== 'object' || Array.isArray(val)) {
            return { valid: false, reason: 'Geometry must be an object with coordinates.' };
          }
          const geom = val as Record<string, unknown>;
          const hasCoords = Array.isArray(geom.coordinates) && geom.coordinates.length >= 2;
          return { valid: hasCoords, reason: 'geometry.coordinates must be an array of [lon, lat].' };
        },
      },
      {
        key: 'properties',
        label: 'Properties Map (properties)',
        required: true,
        expectedType: 'object',
        description: 'Key-value map containing attributes and metadata tags.',
      },
    ],
  },
  {
    id: 'manifest_record',
    name: 'Cryptographic Provenance Manifest',
    description: 'Bit-for-bit file migration and SHA-256 verification payload schema.',
    defaultPayload: {
      authority: 'US 1 AUTHORITY',
      entity: '13 Aerospace Defense Company',
      record_id: 'geo-migrate-2026-10-07-01',
      expected_sha256: 'db2d4737f4f7342b20a5727a7320bacfcc98a8cf41926d9474c2e412b54dd44f',
      device_serial: 'AF312TYQ23073108072',
      architecture: 'arm64-v8a',
    },
    rules: [
      {
        key: 'authority',
        label: 'Issuing Authority (authority)',
        required: true,
        expectedType: 'string',
        description: 'Authoritative administrative designation label.',
      },
      {
        key: 'entity',
        label: 'Entity Name (entity)',
        required: true,
        expectedType: 'string',
        description: 'Operating company or organizational entity.',
      },
      {
        key: 'record_id',
        label: 'Record Identifier (record_id)',
        required: true,
        expectedType: 'string',
        description: 'Unique manifest record reference.',
      },
      {
        key: 'expected_sha256',
        label: 'Expected Checksum (expected_sha256)',
        required: true,
        expectedType: 'string',
        description: '64-character hexadecimal SHA-256 string.',
        formatCheck: (val) => ({
          valid: typeof val === 'string' && /^[a-fA-F0-9]{64}$/.test(val),
          reason: 'Expected 64-character hex string (SHA-256 hash digest).',
        }),
      },
      {
        key: 'device_serial',
        label: 'Device Serial (device_serial)',
        required: true,
        expectedType: 'string',
        description: 'Hardware profile device serial number.',
      },
    ],
  },
];

function getActualType(val: unknown): FieldType {
  if (Array.isArray(val)) return 'array';
  if (val === null) return 'object';
  const t = typeof val;
  if (t === 'string' || t === 'number' || t === 'boolean' || t === 'object') return t;
  return 'string';
}

export const PayloadValidator: React.FC = () => {
  const [selectedSchemaId, setSelectedSchemaId] = useState<string>('govinfo_granule');
  const activeSchema = SCHEMAS.find((s) => s.id === selectedSchemaId) || SCHEMAS[0];

  const [jsonInput, setJsonInput] = useState<string>(
    JSON.stringify(activeSchema.defaultPayload, null, 2)
  );
  const [parsedData, setParsedData] = useState<Record<string, unknown> | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [sha256Hash, setSha256Hash] = useState<string>('Calculating...');
  const [copied, setCopied] = useState<boolean>(false);

  // Compute SHA-256 Digest using native Web Crypto API
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

  // Parse JSON and compute hash
  useEffect(() => {
    computeHash(jsonInput);
    try {
      const parsed = JSON.parse(jsonInput);
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        setParsedData(parsed as Record<string, unknown>);
      } else {
        setParsedData(null);
      }
      setParseError(null);
    } catch (err: unknown) {
      setParsedData(null);
      setParseError((err as Error).message);
    }
  }, [jsonInput, computeHash]);

  // Schema-specific field validation results
  const validationResults = useMemo(() => {
    return activeSchema.rules.map((rule) => {
      if (!parsedData) {
        return {
          ...rule,
          status: 'error' as const,
          statusText: 'JSON PARSE ERROR',
          actualType: 'none',
          actualValue: undefined,
          errorMessage: parseError || 'Invalid JSON document.',
        };
      }

      const hasKey = rule.key in parsedData;
      if (!hasKey) {
        return {
          ...rule,
          status: rule.required ? ('missing' as const) : ('optional_missing' as const),
          statusText: rule.required ? 'MISSING KEY' : 'OPTIONAL NOT SET',
          actualType: 'undefined',
          actualValue: undefined,
          errorMessage: rule.required ? `Required field "${rule.key}" is absent from payload.` : undefined,
        };
      }

      const val = parsedData[rule.key];
      const actualType = getActualType(val);

      if (actualType !== rule.expectedType) {
        return {
          ...rule,
          status: 'type_mismatch' as const,
          statusText: 'TYPE MISMATCH',
          actualType,
          actualValue: val,
          errorMessage: `Expected data type "${rule.expectedType}", but found "${actualType}".`,
        };
      }

      if (rule.formatCheck) {
        const fmt = rule.formatCheck(val);
        if (!fmt.valid) {
          return {
            ...rule,
            status: 'format_error' as const,
            statusText: 'FORMAT ERROR',
            actualType,
            actualValue: val,
            errorMessage: fmt.reason || 'Field failed structural format constraints.',
          };
        }
      }

      return {
        ...rule,
        status: 'valid' as const,
        statusText: `PASS (${rule.expectedType})`,
        actualType,
        actualValue: val,
        errorMessage: undefined,
      };
    });
  }, [parsedData, parseError, activeSchema]);

  const errorCount = validationResults.filter(
    (r) => r.status === 'missing' || r.status === 'type_mismatch' || r.status === 'format_error' || r.status === 'error'
  ).length;

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

  const handleSwitchSchema = (schemaId: string) => {
    setSelectedSchemaId(schemaId);
    const target = SCHEMAS.find((s) => s.id === schemaId);
    if (target) {
      setJsonInput(JSON.stringify(target.defaultPayload, null, 2));
    }
  };

  // Auto-inject missing required fields into JSON
  const handleInjectMissingFields = () => {
    try {
      const current = parsedData ? { ...parsedData } : {};
      activeSchema.rules.forEach((rule) => {
        if (rule.required && !(rule.key in current)) {
          if (rule.key in activeSchema.defaultPayload) {
            current[rule.key] = activeSchema.defaultPayload[rule.key];
          } else {
            current[rule.key] =
              rule.expectedType === 'string'
                ? 'stub_value'
                : rule.expectedType === 'number'
                ? 0
                : rule.expectedType === 'boolean'
                ? true
                : rule.expectedType === 'array'
                ? []
                : {};
          }
        }
      });
      setJsonInput(JSON.stringify(current, null, 2));
    } catch (err) {
      // Ignore
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 font-mono text-gray-200 selection:bg-cyan-500 selection:text-black">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="border-b border-gray-800 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl font-bold tracking-wider text-cyan-400">
                PUBLIC DOCUMENT & PAYLOAD INTEGRITY VALIDATOR
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  errorCount === 0 && !parseError
                    ? 'bg-green-950 text-green-400 border-green-800'
                    : 'bg-red-950 text-red-400 border-red-800'
                }`}
              >
                {errorCount === 0 && !parseError ? 'ALL FIELDS VALID' : `${errorCount} ISSUES DETECTED`}
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Real-time Web Crypto SHA-256 digest calculation, schema-specific type checking, and format diagnostics.
            </p>
          </div>

          {/* Schema Selector Tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            {SCHEMAS.map((schema) => (
              <button
                key={schema.id}
                onClick={() => handleSwitchSchema(schema.id)}
                className={`px-3 py-1.5 text-xs rounded border transition cursor-pointer ${
                  selectedSchemaId === schema.id
                    ? 'bg-cyan-500 text-black font-bold border-cyan-400 shadow-md shadow-cyan-500/20'
                    : 'bg-gray-800 hover:bg-gray-700 text-cyan-300 border-gray-700'
                }`}
              >
                {schema.name}
              </button>
            ))}
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center justify-between flex-wrap gap-3 bg-[#111622] border border-gray-800 p-3 rounded-lg text-xs">
          <div className="text-gray-400">
            Active Schema Profile:{' '}
            <span className="text-cyan-400 font-bold">{activeSchema.name}</span>
            <span className="hidden sm:inline text-gray-500 ml-2">({activeSchema.description})</span>
          </div>

          <div className="flex items-center gap-2">
            {errorCount > 0 && (
              <button
                onClick={handleInjectMissingFields}
                className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded transition cursor-pointer font-bold"
              >
                Auto-Fix Missing Keys
              </button>
            )}
            <button
              onClick={formatJson}
              className="px-3 py-1 bg-cyan-950 hover:bg-cyan-900 text-cyan-200 border border-cyan-800 rounded transition cursor-pointer"
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
                {new TextEncoder().encode(jsonInput).length} bytes · {jsonInput.split('\n').length} lines
              </span>
            </div>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder="Paste JSON payload here..."
              className="w-full h-[440px] bg-[#0B0F17] text-cyan-300 text-xs p-3 rounded border border-gray-800 focus:outline-none focus:border-cyan-500 resize-none font-mono leading-relaxed"
              spellCheck={false}
            />
            {parseError && (
              <div className="mt-3 p-3 bg-red-950/50 border border-red-800 text-red-400 text-xs rounded flex items-start gap-2">
                <span className="font-bold shrink-0">PARSE ERROR:</span>
                <span className="break-all">{parseError}</span>
              </div>
            )}
          </div>

          {/* Right Column: Integrity Audit & Schema Diagnostics Panel */}
          <div className="flex flex-col space-y-6">
            {/* SHA-256 Integrity Card */}
            <div className="bg-[#111622] border border-gray-800 rounded-lg p-4 shadow-xl">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-gray-400 tracking-wider">
                  CRYPTOGRAPHIC SHA-256 DIGEST
                </span>
                <button
                  onClick={handleCopyHash}
                  className="text-xs text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer font-bold"
                >
                  {copied ? '[ COPIED ]' : '[ COPY HASH ]'}
                </button>
              </div>
              <div className="bg-[#0B0F17] p-3 rounded border border-gray-800 text-cyan-400 text-xs break-all select-all font-bold">
                {sha256Hash}
              </div>
            </div>

            {/* Schema-Specific Field Conformance Checklist */}
            <div className="bg-[#111622] border border-gray-800 rounded-lg p-4 shadow-xl flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-3 border-b border-gray-800 pb-2">
                <span className="text-xs font-semibold text-gray-400 tracking-wider">
                  FIELD-LEVEL SCHEMA CONFORMANCE AUDIT
                </span>
                <span className="text-[11px] text-gray-500">
                  {validationResults.filter((r) => r.status === 'valid').length} / {validationResults.length} fields valid
                </span>
              </div>

              <div className="space-y-3 overflow-y-auto max-h-[340px] pr-1">
                {validationResults.map((result) => {
                  const isPass = result.status === 'valid';
                  const isMissing = result.status === 'missing';
                  const isMismatch = result.status === 'type_mismatch';
                  const isFormatError = result.status === 'format_error';

                  return (
                    <div
                      key={result.key}
                      className={`p-3 rounded border text-xs flex flex-col gap-1.5 transition-colors ${
                        isPass
                          ? 'bg-[#0B0F17] border-gray-800'
                          : isMissing
                          ? 'bg-red-950/20 border-red-800/80'
                          : 'bg-amber-950/20 border-amber-800/80'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-white font-bold truncate">{result.key}</span>
                          <span className="text-gray-500 text-[10px]">({result.expectedType})</span>
                          {result.required && (
                            <span className="text-red-400 text-[10px] uppercase font-bold">req</span>
                          )}
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 border ${
                            isPass
                              ? 'bg-green-950 text-green-400 border-green-800'
                              : isMissing
                              ? 'bg-red-950 text-red-400 border-red-800'
                              : isMismatch
                              ? 'bg-purple-950 text-purple-400 border-purple-800'
                              : 'bg-amber-950 text-amber-400 border-amber-800'
                          }`}
                        >
                          {result.statusText}
                        </span>
                      </div>

                      {/* Error Diagnostics Callout */}
                      {result.errorMessage && (
                        <div className="text-[11px] font-mono text-red-400 bg-red-950/40 p-2 rounded border border-red-900/50 mt-1">
                          {result.errorMessage}
                        </div>
                      )}

                      {/* Actual Value Snapshot */}
                      {result.actualValue !== undefined && (
                        <div className="text-[11px] text-gray-400 font-mono flex items-baseline gap-1 mt-0.5 truncate">
                          <span className="text-gray-500">Value:</span>
                          <span className="text-cyan-300 font-mono truncate">
                            {typeof result.actualValue === 'object'
                              ? JSON.stringify(result.actualValue)
                              : String(result.actualValue)}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Formatted JSON Tree View */}
        <div className="bg-[#111622] border border-gray-800 rounded-lg p-4 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-400 tracking-wider">
              PARSED METADATA SCHEMA READOUT
            </span>
            <span className="text-xs text-gray-500">
              {parsedData ? `${Object.keys(parsedData).length} attributes parsed` : 'Unparsed'}
            </span>
          </div>
          <pre className="bg-[#0B0F17] p-4 rounded border border-gray-800 text-cyan-300 text-xs overflow-x-auto max-h-64 leading-relaxed">
            {parsedData
              ? JSON.stringify(parsedData, null, 2)
              : '// Invalid JSON - awaiting correct payload structure...'}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default PayloadValidator;
