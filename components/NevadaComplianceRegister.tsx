import React, { useState, useMemo } from 'react';
import {
  NV_REGULATORY_REGISTER,
  RegulatoryClaim,
} from '../data/regulatoryData';

export const NevadaComplianceRegister: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedClaim, setSelectedClaim] = useState<RegulatoryClaim | null>(null);
  const [copiedFixity, setCopiedFixity] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const claims = NV_REGULATORY_REGISTER.register.claims;
  const controls = NV_REGULATORY_REGISTER.register.controls;
  const metadata = NV_REGULATORY_REGISTER.metadata;
  const record = NV_REGULATORY_REGISTER.register.record;
  const projectState = NV_REGULATORY_REGISTER.register.current_project_state;

  const statuses = useMemo(() => {
    const set = new Set(claims.map((c) => c.status));
    return ['ALL', ...Array.from(set)];
  }, [claims]);

  const filteredClaims = useMemo(() => {
    return claims.filter((c) => {
      const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.id.toLowerCase().includes(q) ||
        c.citation.toLowerCase().includes(q) ||
        c.topic.toLowerCase().includes(q) ||
        c.claim.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [claims, statusFilter, searchQuery]);

  const handleCopyFixity = () => {
    navigator.clipboard.writeText(metadata.sha256_fixity);
    setCopiedFixity(true);
    setTimeout(() => setCopiedFixity(false), 2000);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(NV_REGULATORY_REGISTER, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleExportJson = () => {
    try {
      const blob = new Blob([JSON.stringify(NV_REGULATORY_REGISTER, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `EXCALIBUR_NV_REG_REGISTER_${metadata.document_control}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Export failed', err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED_WITH_SCOPE_REVIEW':
        return 'bg-emerald-950/70 text-emerald-300 border-emerald-500/50';
      case 'REQUIRES_EVIDENCE':
        return 'bg-amber-950/70 text-amber-300 border-amber-500/50';
      case 'REQUIRES_HUMAN_REVIEW':
        return 'bg-purple-950/70 text-purple-300 border-purple-500/50';
      case 'PROPOSED':
        return 'bg-cyan-950/70 text-cyan-300 border-cyan-500/50';
      case 'NOT_ESTABLISHED':
        return 'bg-rose-950/70 text-rose-300 border-rose-500/50';
      case 'NOT_PROPOSED':
        return 'bg-slate-800 text-slate-400 border-slate-700';
      default:
        return 'bg-gray-800 text-gray-300 border-gray-700';
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Top Document Header */}
      <div className="bg-[#101622] border border-white/10 rounded-xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-white/10 pb-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-mono font-bold tracking-wider uppercase">
                {metadata.status}
              </span>
              <span className="px-2.5 py-1 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/40 text-[11px] font-mono tracking-wider">
                DOC: {metadata.document_control}
              </span>
              <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-mono tracking-wider">
                VER {metadata.version}
              </span>
              <span className="px-2.5 py-1 rounded bg-purple-950/60 text-purple-300 border border-purple-500/40 text-[11px] font-mono tracking-wider">
                NEVADA JURISDICTION
              </span>
            </div>

            <h2 className="font-['Barlow_Condensed',sans-serif] text-3xl sm:text-4xl font-extrabold uppercase text-white mt-1">
              Project EXCALIBUR · NV Regulatory Claim Register
            </h2>

            <p className="text-slate-300 text-sm max-w-4xl leading-relaxed">
              Official compliance controls framework governing research boundaries under <strong className="text-white">NRS Chapter 625</strong>, <strong className="text-white">NAC Chapter 625</strong>, and <strong className="text-white">NAC Chapter 329</strong>. Maintained by <strong className="text-amber-300">{record.entity}</strong> for internal compliance and statutory due diligence.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400">
              <div><span className="text-slate-500">PROJECT:</span> {record.project}</div>
              <div><span className="text-slate-500">HEARING REF:</span> {record.hearing_reference.date} ({record.hearing_reference.board})</div>
              <div><span className="text-slate-500">FEDERAL STATUS:</span> <span className="text-emerald-400 font-bold">{projectState.federal_submission_authorization}</span></div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
            <button
              onClick={handleExportJson}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold font-mono text-xs uppercase tracking-wider rounded transition cursor-pointer flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Export Register (JSON)</span>
            </button>

            <button
              onClick={handleCopyJson}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold font-mono text-xs uppercase tracking-wider rounded border border-white/10 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{copiedJson ? '✓ Copied Register' : 'Copy Full Register'}</span>
            </button>

            {downloadSuccess && (
              <div className="text-[11px] font-mono text-emerald-400 text-center">
                ✓ Register exported to JSON
              </div>
            )}
          </div>
        </div>

        {/* SHA-256 Fixity Banner */}
        <div className="bg-black/50 p-4 rounded-lg border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs font-mono">
          <div className="space-y-1">
            <span className="text-slate-500 block uppercase tracking-wider text-[10px]">
              SHA-256 Cryptographic Fixity (Compliance Control Baseline)
            </span>
            <span className="text-purple-300 break-all">{metadata.sha256_fixity}</span>
          </div>
          <button
            onClick={handleCopyFixity}
            className="px-3 py-1 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs hover:bg-purple-500/30 transition shrink-0 cursor-pointer"
          >
            {copiedFixity ? '✓ Copied' : 'Copy Digest'}
          </button>
        </div>
      </div>

      {/* Current Project State & Gates */}
      <div className="bg-[#121824] border border-white/10 rounded-xl p-6 space-y-4">
        <h3 className="font-['Barlow_Condensed',sans-serif] text-xl font-bold uppercase text-white flex items-center gap-2 text-cyan-400">
          <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Current Project State Gates & Boundaries
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs font-mono">
          <div className="bg-black/40 p-3 rounded border border-white/5 space-y-1">
            <span className="text-slate-500 block text-[10px]">PROJECT R&D</span>
            <span className="text-cyan-300 font-bold">{projectState.project_r_and_d}</span>
          </div>
          <div className="bg-black/40 p-3 rounded border border-white/5 space-y-1">
            <span className="text-slate-500 block text-[10px]">REGULATED PE SVCS</span>
            <span className="text-rose-400 font-bold">{projectState.regulated_pe_services}</span>
          </div>
          <div className="bg-black/40 p-3 rounded border border-white/5 space-y-1">
            <span className="text-slate-500 block text-[10px]">REGULATED PLS SVCS</span>
            <span className="text-rose-400 font-bold">{projectState.regulated_pls_services}</span>
          </div>
          <div className="bg-black/40 p-3 rounded border border-white/5 space-y-1">
            <span className="text-slate-500 block text-[10px]">RESPONSIBLE CHARGE</span>
            <span className="text-rose-400 font-bold">{projectState.responsible_charge}</span>
          </div>
          <div className="bg-black/40 p-3 rounded border border-white/5 space-y-1">
            <span className="text-slate-500 block text-[10px]">CORNER RECORD WORK</span>
            <span className="text-slate-400 font-bold">{projectState.corner_record_activity}</span>
          </div>
          <div className="bg-black/40 p-3 rounded border border-white/5 space-y-1">
            <span className="text-slate-500 block text-[10px]">FEDERAL PROPOSALS</span>
            <span className="text-emerald-400 font-bold">{projectState.federal_submission_authorization}</span>
          </div>
        </div>
      </div>

      {/* Active Compliance Controls (CTRL-NV-001 to CTRL-NV-007) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
          <h3 className="font-['Barlow_Condensed',sans-serif] text-2xl font-bold uppercase text-white flex items-center gap-2 text-amber-400">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            Active Internal Compliance Controls ({controls.length})
          </h3>
          <span className="text-xs font-mono text-slate-400">
            MANDATORY PROTOCOLS FOR ALL EXCALIBUR MATERIALS & FIELD OPERATIONS
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {controls.map((ctrl) => (
            <div
              key={ctrl.id}
              className="bg-[#121824] border border-amber-500/20 rounded-xl p-5 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                    {ctrl.id}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono font-bold">
                    {ctrl.status}
                  </span>
                </div>
                <h4 className="font-['Barlow_Condensed',sans-serif] text-lg font-bold uppercase text-white">
                  {ctrl.name}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {ctrl.rule}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Claims Register Inspection Console */}
      <div className="bg-[#101622] border border-white/10 rounded-xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-white/10 pb-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">
              // STATUTORY & REGULATORY CITATIONS ({claims.length} CLAIMS)
            </span>
            <h3 className="font-['Barlow_Condensed',sans-serif] text-2xl sm:text-3xl font-extrabold uppercase text-white mt-1">
              Claims & Statutory Evaluation Register
            </h3>
          </div>

          {/* Search Box */}
          <div className="w-full lg:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by citation, topic, keyword..."
              className="w-full bg-[#090D15] border border-white/10 rounded px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400 placeholder:text-slate-600"
            />
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 font-mono text-[11px]">
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded transition cursor-pointer whitespace-nowrap border ${
                statusFilter === st
                  ? 'bg-amber-400 text-black font-bold border-amber-400'
                  : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
              }`}
            >
              {st} {st !== 'ALL' && `(${claims.filter((c) => c.status === st).length})`}
            </button>
          ))}
        </div>

        {/* Claims Table / Grid */}
        <div className="space-y-3">
          {filteredClaims.map((item) => {
            const isSelected = selectedClaim?.id === item.id;
            return (
              <div
                key={item.id}
                className={`bg-[#0A0E17] border rounded-lg transition-all ${
                  isSelected
                    ? 'border-cyan-500 shadow-lg'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div
                  onClick={() => setSelectedClaim(isSelected ? null : item)}
                  className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                      {item.id}
                    </span>
                    <span className="font-mono text-xs text-cyan-300 font-bold bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/30">
                      {item.citation}
                    </span>
                    <span className="font-['Barlow_Condensed',sans-serif] text-base font-bold uppercase text-white">
                      {item.topic}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[11px] font-mono border font-bold ${getStatusBadge(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>
                    <span className="text-slate-500 text-xs font-mono">
                      {isSelected ? '▲ Close' : '▼ Details'}
                    </span>
                  </div>
                </div>

                {/* Expanded Card Details */}
                {isSelected && (
                  <div className="border-t border-white/10 p-5 space-y-4 bg-[#080C14] rounded-b-lg text-xs font-mono">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase tracking-wider mb-1">
                        STATUTORY / REGULATORY CLAIM:
                      </span>
                      <p className="text-slate-200 text-xs sm:text-sm font-sans leading-relaxed">
                        {item.claim}
                      </p>
                    </div>

                    {item.disposition && (
                      <div className="p-3 rounded bg-rose-950/60 border border-rose-500/40 text-rose-300 space-y-1">
                        <strong className="block text-rose-400 uppercase tracking-wider text-[11px]">
                          DISPOSITION & WARNING:
                        </strong>
                        <p className="font-sans text-xs">{item.disposition}</p>
                      </div>
                    )}

                    {item.prohibited_use && item.prohibited_use.length > 0 && (
                      <div className="p-3 rounded bg-red-950/40 border border-red-500/30 text-red-200 space-y-1">
                        <strong className="block text-red-400 uppercase tracking-wider text-[11px]">
                          PROHIBITED USE / OPERATIONAL SAFEGUARDS:
                        </strong>
                        <ul className="list-disc list-inside space-y-0.5">
                          {item.prohibited_use.map((p, i) => (
                            <li key={i}>{p}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {item.excalibur_control && (
                      <div className="p-3 rounded bg-cyan-950/60 border border-cyan-500/40 text-cyan-200 space-y-1">
                        <strong className="block text-cyan-400 uppercase tracking-wider text-[11px]">
                          EXCALIBUR COMPLIANCE CONTROL:
                        </strong>
                        <p className="font-sans text-xs">{item.excalibur_control}</p>
                      </div>
                    )}

                    {item.control && (
                      <div className="p-3 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 space-y-1">
                        <strong className="block text-emerald-400 uppercase tracking-wider text-[11px]">
                          DIRECTIVE CONTROL:
                        </strong>
                        <p className="font-sans text-xs">{item.control}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      {item.excalibur_trigger && (
                        <div className="bg-black/40 p-3 rounded border border-white/5 space-y-1">
                          <span className="text-slate-500 block text-[10px] uppercase">
                            REGULATORY TRIGGERS:
                          </span>
                          <ul className="list-disc list-inside text-slate-300 text-[11px] space-y-0.5">
                            {item.excalibur_trigger.map((t, idx) => (
                              <li key={idx}>{t}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {item.evidence_required && (
                        <div className="bg-black/40 p-3 rounded border border-white/5 space-y-1">
                          <span className="text-slate-500 block text-[10px] uppercase">
                            EVIDENCE REQUIRED:
                          </span>
                          <ul className="list-disc list-inside text-slate-300 text-[11px] space-y-0.5">
                            {item.evidence_required.map((e, idx) => (
                              <li key={idx}>{e}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-white/5 text-[11px] text-slate-500">
                      <div>
                        HUMAN REVIEW REQUIRED:{' '}
                        <span className={item.human_review_required ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                          {item.human_review_required ? 'YES' : 'NO'}
                        </span>
                      </div>
                      {item.evidence_source && (
                        <div>
                          SOURCE: <span className="text-slate-300">{item.evidence_source}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
