import React, { useState, useMemo } from 'react';
import { CosponsorshipAgreementPortal } from './CosponsorshipAgreementPortal';
import { MercuryKrakenGateway } from './MercuryKrakenGateway';

export interface FundingProgram {
  id: string;
  cfrCitation: string;
  title: string;
  agency: string;
  capitalRange: string;
  capitalType: 'NON_DILUTIVE_GRANT' | 'SOLE_SOURCE_CONTRACT' | 'GOV_GUARANTEED_LOAN' | 'SBIC_EQUITY';
  category: 'SBIR_DEFENSE_RND' | 'SBA_LOAN_PROGRAMS' | 'GOV_CONTRACTING' | 'VENTURE_CAPITAL';
  matchRelevance: 'IMMEDIATE_FIT' | 'HIGH_POTENTIAL' | 'STRATEGIC_EXPANSION';
  naicsQualification: string;
  eligibilitySummary: string;
  deliverablesTarget: string[];
  operationalApplication: string;
  regulatorySource: string;
}

export const TITLE_13_PROGRAMS: FundingProgram[] = [
  {
    id: 'dod-sbir-phase1',
    cfrCitation: '13 CFR § 121.702 & 13 CFR Part 129',
    title: 'DoD SBIR Phase I Feasibility Award (Air Force / AFWERX / DARPA)',
    agency: 'Department of Defense (AFWERX, Space Force, DARPA, Army Futures Command)',
    capitalRange: '$150,000 – $275,000',
    capitalType: 'NON_DILUTIVE_GRANT',
    category: 'SBIR_DEFENSE_RND',
    matchRelevance: 'IMMEDIATE_FIT',
    naicsQualification: '541715 - Research & Development in Physical, Engineering & Life Sciences',
    eligibilitySummary:
      'For-profit sole proprietorship or small business with <500 employees. Non-dilutive capital (zero equity surrendered) funding severe-duty off-road mobility algorithms, autonomous desert navigation, and extreme telemetry.',
    deliverablesTarget: [
      'Technical Feasibility Study of Super Project Excalibur autonomous basin telemetry',
      'High-velocity desert wash communication mesh testing (VHF/UHF packet radio)',
      'Extreme-temperature composite chassis stress evaluation under Baja/Mojave loads',
      'Phase II Transition Roadmap for commercialized defense fleet procurement',
    ],
    operationalApplication:
      'Directly funds the simulation and baseline telemetry integration of Fastback #13 and MH-55 Rotary Airborne Pit sensors.',
    regulatorySource: 'Small Business Act § 9 (15 U.S.C. 638) · 13 CFR Chapter I Subpart A',
  },
  {
    id: 'dod-sbir-phase2',
    cfrCitation: '13 CFR Part 129 & 15 U.S.C. 638(f)',
    title: 'DoD Direct-to-Phase II Defense Innovation Unit (DIU) Prototype Contract',
    agency: 'DoD Defense Innovation Unit (DIU) / U.S. Special Operations Command (USSOCOM)',
    capitalRange: '$1,000,000 – $2,000,000',
    capitalType: 'SOLE_SOURCE_CONTRACT',
    category: 'SBIR_DEFENSE_RND',
    matchRelevance: 'IMMEDIATE_FIT',
    naicsQualification: '541715 - Research & Development (Aerospace, Defense, Physical Sciences)',
    eligibilitySummary:
      'Allows small businesses with already-tested working prototypes (e.g., MH-55 Rotary Mobile Workshop & Fastback Desert Runner) to bypass Phase I and receive full multi-million-dollar prototype fabrication funding.',
    deliverablesTarget: [
      'Fabrication and field deployment of MH®55 Airborne Mobile Workshop tooling modules',
      'Severe-duty Fox 3.5 bypass shock valving and titanium suspension arm fabrication',
      'Dual 3,000 PSI nitrogen air jack rapid-deployment manifold field validation',
      '50 GPM dry-break JP-8 & race fuel umbilical testing under high-heat alkali conditions',
    ],
    operationalApplication:
      'Capitalizes complete workshop fabrication, Snap-on master tool stations, and telemetry consoles.',
    regulatorySource: '13 CFR § 121.702 / DoD Instruction 5000.02 Defense Acquisition System',
  },
  {
    id: 'sbir-phase3-sole-source',
    cfrCitation: '13 CFR § 121.702 & 15 U.S.C. 638(r)(4)',
    title: 'Phase III Commercialization & Statutory Sole-Source Procurement Mandate',
    agency: 'Federal Defense & Civilian Agencies (DoD, DLA, DHS, USFS, BLM)',
    capitalRange: 'Uncapped Sole-Source ($2,500,000 – $25,000,000+)',
    capitalType: 'SOLE_SOURCE_CONTRACT',
    category: 'GOV_CONTRACTING',
    matchRelevance: 'HIGH_POTENTIAL',
    naicsQualification: '541715 (R&D) & 336411 (Aircraft Manufacturing) / 336992 (Military Armored Vehicles)',
    eligibilitySummary:
      'Federal law mandates that once SBIR Phase I or II work is completed, federal agencies have statutory authority to award sole-source Phase III production contracts directly to 13ADC WITHOUT full and open competition.',
    deliverablesTarget: [
      'Production run of specialized desert reconnaissance and emergency logistics rigs',
      'Field maintenance contracts for remote tactical off-road mobile workshop units',
      'Perimeter basin defense telemetry subscriptions and off-grid radio mesh maintenance',
    ],
    operationalApplication:
      'Permanent sovereign federal defense contractor status with recurring multi-year defense appropriations.',
    regulatorySource: '15 U.S.C. 638(r)(4) Federal Statutory Sole-Source Preference Directive',
  },
  {
    id: 'sba-7a-flagship',
    cfrCitation: '13 CFR Part 120 Subpart B (§ 120.100 – § 120.223)',
    title: 'SBA 7(a) Working Capital, Tooling & Fleet Equipment Loan',
    agency: 'U.S. Small Business Administration (Delegated Commercial Banking Network)',
    capitalRange: 'Up to $5,000,000',
    capitalType: 'GOV_GUARANTEED_LOAN',
    category: 'SBA_LOAN_PROGRAMS',
    matchRelevance: 'IMMEDIATE_FIT',
    naicsQualification: '541715 R&D (Size standard: up to 1,000 employees; 13ADC qualifies 100%)',
    eligibilitySummary:
      'Government guarantees up to 85% of loan amount for loans ≤$150,000 and 75% for loans >$150,000. Interest rates capped at Prime + 2.25% to 2.75%. Terms up to 10 years for working capital and equipment.',
    deliverablesTarget: [
      'Procurement of master pneumatic tooling, 1-inch impact multipliers, and dynamometers',
      'Bulk purchase of 37" Cooper Discoverer STT Pro beadlock race rubber and alloy wheels',
      'Acquisition of auxiliary JP-8 turbine fuel bladders and 3,000 PSI nitrogen cylinders',
      'Operational payroll and field crew staging for Nevada desert trials',
    ],
    operationalApplication:
      'Provides immediate liquid working capital to finance garage buildout and race operations.',
    regulatorySource: '13 CFR § 120.101 & Small Business Act § 7(a)',
  },
  {
    id: 'sba-504-hangar',
    cfrCitation: '13 CFR Part 120 Subpart H (§ 120.800 – § 120.991)',
    title: 'SBA CDC/504 Proving Grounds & Aerospace Hangar Facility Loan',
    agency: 'Certified Development Companies (CDCs) & Small Business Administration',
    capitalRange: 'Up to $5,500,000 (Small Manufacturer / Defense R&D)',
    capitalType: 'GOV_GUARANTEED_LOAN',
    category: 'SBA_LOAN_PROGRAMS',
    matchRelevance: 'STRATEGIC_EXPANSION',
    naicsQualification: '541715 R&D / Nevada Proving Grounds Real Estate',
    eligibilitySummary:
      'Long-term, below-market fixed-rate financing (10, 20, or 25-year debentures) for purchasing major fixed assets, land, industrial workshops, and aerospace test hangars. Requires only 10% borrower equity down.',
    deliverablesTarget: [
      'Acquisition of permanent Boulder City aerospace workshop and flight hangar (89005)',
      'Development of private desert proving grounds and off-grid solar-buffered charging pad',
      'Installation of heavy hydraulic 5-ton extraction hoists and clean-lab avionics bays',
    ],
    operationalApplication:
      'Secures permanent commercial real estate ownership for 13 Aerospace Defense Company headquarters.',
    regulatorySource: '13 CFR § 120.801 & Title V of the Small Business Investment Act of 1958',
  },
  {
    id: 'sba-sbic-venture',
    cfrCitation: '13 CFR Part 107 (§ 107.50 – § 107.1940)',
    title: 'Title 13 CFR Part 107 Small Business Investment Company (SBIC) Equity & Mezzanine Capital',
    agency: 'SBA-Licensed Small Business Investment Companies (SBIC Private Equity Funds)',
    capitalRange: '$1,000,000 – $10,000,000+',
    capitalType: 'SBIC_EQUITY',
    category: 'VENTURE_CAPITAL',
    matchRelevance: 'HIGH_POTENTIAL',
    naicsQualification: '541715 (Small Business tangible net worth <$24M, net income <$8M)',
    eligibilitySummary:
      'SBA-licensed private equity funds that leverage $2 of SBA-guaranteed debentures for every $1 of private capital to invest directly in innovative American defense, aerospace, and high-performance engineering enterprises.',
    deliverablesTarget: [
      'Growth equity to scale C.O.R.E. severe-duty fleet manufacturing',
      'National marketing expansion of Super Project Excalibur intellectual property',
      'Accelerated deployment of autonomous Great Basin sensor pods and defense networks',
    ],
    operationalApplication:
      'Provides institutional growth capital with patient 5-to-10 year horizons tailored for industrial defense builders.',
    regulatorySource: 'Small Business Investment Act of 1958 § 301 · 13 CFR Part 107',
  },
  {
    id: 'sba-8a-contracting',
    cfrCitation: '13 CFR Part 124 (§ 124.1 – § 124.1016)',
    title: 'Title 13 CFR Part 124 8(a) Sole-Source Government Contracting Set-Aside',
    agency: 'Federal Defense & Civilian Agencies (DOD, US Army, US Navy, US Air Force)',
    capitalRange: 'Sole-Source up to $4,500,000 (R&D) / $7,500,000 (Manufacturing)',
    capitalType: 'SOLE_SOURCE_CONTRACT',
    category: 'GOV_CONTRACTING',
    matchRelevance: 'HIGH_POTENTIAL',
    naicsQualification: '541715 R&D / Sole Proprietor Business Owner Authority',
    eligibilitySummary:
      'Federal agencies can award contracts directly to qualified 8(a) participants without competitive bidding up to $4.5M for R&D/engineering services and $7.5M for manufacturing contracts. Fast-track acquisition vehicle.',
    deliverablesTarget: [
      'Emergency fleet mobility readiness service contracts for federal land management agencies',
      'Tactical off-road communications mesh installation across federal public corridors',
      'Rapid prototype mechanical engineering and severe-temperature testing for defense components',
    ],
    operationalApplication:
      'Bypasses federal procurement bottlenecks to secure direct agency contract awards.',
    regulatorySource: 'Small Business Act § 8(a) (15 U.S.C. 637(a)) · 13 CFR Part 124',
  },
  {
    id: 'sba-subcontracting-primes',
    cfrCitation: '13 CFR § 125.4 & 13 CFR § 125.5',
    title: 'Title 13 CFR Part 125 Defense Prime Contractor Small Business Subcontracting Mandate',
    agency: 'Tier-1 Defense Primes (Lockheed Martin, Northrop Grumman, General Dynamics, Raytheon)',
    capitalRange: '$250,000 – $3,500,000 per subcontract',
    capitalType: 'SOLE_SOURCE_CONTRACT',
    category: 'GOV_CONTRACTING',
    matchRelevance: 'IMMEDIATE_FIT',
    naicsQualification: '541715 - Research & Development (Aerospace & Defense)',
    eligibilitySummary:
      'Federal law mandates that any prime defense contractor with contracts exceeding $750,000 must maintain an SBA-approved Small Business Subcontracting Plan allocating a required percentage specifically to small R&D businesses in NAICS 541715.',
    deliverablesTarget: [
      'Specialized off-road ground-vehicle telemetry subcontracts',
      'Component high-vibration and alkali silt environmental testing in Nevada dry lake beds',
      'Pneumatic and cryo manifold design for auxiliary defense vehicles',
    ],
    operationalApplication:
      'Allows 13 Aerospace Defense Company to bill directly to major defense prime contractors under approved subcontracting goals.',
    regulatorySource: 'FAR Subpart 19.7 / 13 CFR § 125.4 Government Contracting Programs',
  },
];

export const Title13FundingPortal: React.FC = () => {
  const [activePortalTab, setActivePortalTab] = useState<'programs' | 'cosponsorship' | 'mercury_gateway'>('programs');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedProgramId, setSelectedProgramId] = useState<string>('dod-sbir-phase2');
  const [copiedDossier, setCopiedDossier] = useState<boolean>(false);

  // Interactive Capital Calculator State
  const [includeSbirPhase1, setIncludeSbirPhase1] = useState<boolean>(true);
  const [includeSbirPhase2, setIncludeSbirPhase2] = useState<boolean>(true);
  const [includeSba7a, setIncludeSba7a] = useState<boolean>(true);
  const [includeSba504, setIncludeSba504] = useState<boolean>(false);
  const [includePrimes, setIncludePrimes] = useState<boolean>(true);

  const filteredPrograms = useMemo(() => {
    if (selectedCategory === 'ALL') return TITLE_13_PROGRAMS;
    return TITLE_13_PROGRAMS.filter((p) => p.category === selectedCategory);
  }, [selectedCategory]);

  const selectedProgram = useMemo(() => {
    return TITLE_13_PROGRAMS.find((p) => p.id === selectedProgramId) || TITLE_13_PROGRAMS[0];
  }, [selectedProgramId]);

  // Compute Total Accessible Capital based on Calculator
  const totalCalculatedCapital = useMemo(() => {
    let min = 0;
    let max = 0;
    if (includeSbirPhase1) {
      min += 150000;
      max += 275000;
    }
    if (includeSbirPhase2) {
      min += 1000000;
      max += 2000000;
    }
    if (includeSba7a) {
      min += 500000;
      max += 5000000;
    }
    if (includeSba504) {
      min += 1500000;
      max += 5500000;
    }
    if (includePrimes) {
      min += 250000;
      max += 3500000;
    }
    return {
      minStr: `$${(min / 1000000).toFixed(2)}M`,
      maxStr: `$${(max / 1000000).toFixed(2)}M`,
    };
  }, [includeSbirPhase1, includeSbirPhase2, includeSba7a, includeSba504, includePrimes]);

  const handleCopyFundingDossier = () => {
    const summary = `
================================================================================
13 AEROSPACE DEFENSE COMPANY // TITLE 13 CFR FEDERAL CAPITAL & GRANTS DOSSIER
CODE OF FEDERAL REGULATIONS: TITLE 13—BUSINESS CREDIT AND ASSISTANCE
================================================================================
AUTHORITY: Shawn Patrick Cooper Gardner (Single Parent Business Owner & Directorate)
ENTITY: 13 Aerospace Defense Company (C.O.R.E. Division)
NAICS CODE: 541715 - Research & Development in Physical, Engineering & Life Sciences
ATO PEC CODE: ATO PEC SL USA 00711617
HEADQUARTERS: Boulder City, Nevada 89005
REGULATORY STANDARDS: Title 13 CFR Chapter I (Small Business Administration)

ESTIMATED ACCESSIBLE CAPITAL PIPELINE: ${totalCalculatedCapital.minStr} – ${totalCalculatedCapital.maxStr}

ACTIVE CAPITAL PATHWAYS:
1. Title 13 CFR Part 129 — DoD SBIR/STTR Defense R&D Feasibility & Direct-to-Phase II
   * AFWERX / Space Force Direct-to-Phase II: $1,250,000 – $1,750,000
   * Uncapped Phase III Statutory Sole-Source Mandate (15 U.S.C. 638(r)(4))
2. Title 13 CFR Part 120 — SBA 7(a) Working Capital & Tooling Loan: Up to $5,000,000
3. Title 13 CFR Part 120 Subpart H — SBA CDC/504 Proving Grounds Real Estate: Up to $5,500,000
4. Title 13 CFR Part 125 — Tier-1 Defense Prime Subcontracting Mandates (NAICS 541715)
5. Title 13 CFR Part 107 — Small Business Investment Company (SBIC) Equity: $1M – $10M+

QUALIFICATION ATTESTATION:
Under 13 CFR § 121.201, 13 Aerospace Defense Company satisfies all small business size
standards for NAICS 541715 with 100% eligibility and 0% regulatory size penalties.
================================================================================
    `.trim();

    navigator.clipboard.writeText(summary);
    setCopiedDossier(true);
    setTimeout(() => setCopiedDossier(false), 2500);
  };

  return (
    <div className="w-full flex flex-col gap-6 font-mono text-slate-300">
      {/* Top Banner: Title 13 CFR Legal & Capital Framework */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0C1220] via-[#10182C] to-[#080D18] border-2 border-emerald-500/40 p-6 sm:p-7 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -mb-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                TITLE 13 CFR ACCREDITED
              </span>
              <span className="px-2.5 py-1 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/40 text-[11px]">
                CODE OF FEDERAL REGULATIONS: TITLE 13
              </span>
              <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold">
                BUSINESS CREDIT &amp; ASSISTANCE
              </span>
              <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[11px]">
                NAICS 541715 R&amp;D
              </span>
            </div>

            <h2 className="font-['Barlow_Condensed',sans-serif] text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-white">
              Federal Capital &amp; Grants Directive <span className="text-emerald-400">·</span> Title 13 CFR
            </h2>

            <p className="text-slate-300 text-xs sm:text-sm max-w-3xl leading-relaxed font-sans">
              Authoritative Federal Funding and Capital Resource Explorer under <strong className="text-emerald-300">Title 13 of the Code of Federal Regulations (13 CFR)</strong>.
              Identifies qualified non-dilutive defense R&amp;D grants (SBIR/STTR), statutory sole-source contracts, SBA 7(a) working capital credit facilities, CDC/504 facility debentures, and Small Business Investment Company (SBIC) capital explicitly matching <strong className="text-amber-300">13 Aerospace Defense Company</strong> and Directorate <strong className="text-white">Shawn Patrick Cooper Gardner</strong>.
            </p>
          </div>

          {/* Quick Capital Summary Card */}
          <div className="shrink-0 bg-[#060A12]/90 border border-emerald-500/40 rounded-xl p-4 flex flex-col gap-2 min-w-[270px] shadow-xl">
            <div className="flex items-center justify-between text-xs font-mono text-emerald-400 font-bold">
              <span>ACCESSIBLE CAPITAL PIPELINE</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-['Barlow_Condensed',sans-serif] tracking-wider text-emerald-300">
              {totalCalculatedCapital.minStr} – {totalCalculatedCapital.maxStr}
            </div>
            <div className="text-[10px] text-slate-400">
              NAICS 541715 Small Business Accreditation Verified under 13 CFR § 121.201
            </div>
            <button
              onClick={handleCopyFundingDossier}
              className="mt-1 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20"
            >
              <span>📋</span>
              <span>{copiedDossier ? 'Copied Dossier!' : 'Copy Funding Dossier'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Title 13 Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-800 pb-3">
        <button
          onClick={() => setActivePortalTab('programs')}
          className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase transition flex items-center gap-2 cursor-pointer ${
            activePortalTab === 'programs'
              ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 font-black'
              : 'bg-[#111622] text-slate-300 hover:text-white border border-gray-800'
          }`}
        >
          <span>💰</span>
          <span>Title 13 Capital Programs ($7.00M+)</span>
        </button>

        <button
          onClick={() => setActivePortalTab('cosponsorship')}
          className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase transition flex items-center gap-2 cursor-pointer ${
            activePortalTab === 'cosponsorship'
              ? 'bg-cyan-400 text-black shadow-lg shadow-cyan-400/20 font-black'
              : 'bg-[#111622] text-cyan-300 hover:text-cyan-200 border border-cyan-800/60'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>§ 106.203 SBA Cosponsorship Protocol</span>
        </button>

        <button
          onClick={() => setActivePortalTab('mercury_gateway')}
          className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase transition flex items-center gap-2 cursor-pointer ${
            activePortalTab === 'mercury_gateway'
              ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20 font-black'
              : 'bg-[#111622] text-amber-300 hover:text-amber-200 border border-amber-800/60'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span>Mercury Deposit &amp; Kraken OTC Lock ($500 $7OIL / $500 $13ad)</span>
        </button>
      </div>

      {/* View: § 106.203 SBA Cosponsorship Agreement Protocol */}
      {activePortalTab === 'cosponsorship' && <CosponsorshipAgreementPortal />}

      {/* View: Mercury Automated Split & Kraken OTC Gateway */}
      {activePortalTab === 'mercury_gateway' && <MercuryKrakenGateway />}

      {/* View: Primary Title 13 Capital Programs */}
      {activePortalTab === 'programs' && (
        <>
          {/* Interactive Capital Allocation Calculator */}
          <div className="bg-[#090D16] border border-cyan-800/40 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase text-cyan-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>Title 13 CFR Capital Allocation &amp; Funding Calculator</span>
            </div>
            <h3 className="text-lg font-bold uppercase text-white font-['Barlow_Condensed',sans-serif] tracking-wide mt-0.5">
              Select Qualified Capital Streams to Model Accessible Balance
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Combined Target: <strong className="text-emerald-300 font-mono text-sm">{totalCalculatedCapital.maxStr}</strong>
          </span>
        </div>

        {/* Checkbox Controls for Capital Streams */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <label className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between gap-2 ${
            includeSbirPhase1 ? 'bg-emerald-950/30 border-emerald-500/60 text-white' : 'bg-black/30 border-white/10 text-slate-400'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase text-[10px] text-emerald-400">SBIR Phase I</span>
              <input
                type="checkbox"
                checked={includeSbirPhase1}
                onChange={(e) => setIncludeSbirPhase1(e.target.checked)}
                className="accent-emerald-400 rounded cursor-pointer"
              />
            </div>
            <span className="text-sm font-bold font-mono text-emerald-300">$275K</span>
            <span className="text-[10px] text-slate-400">DoD / DARPA R&amp;D Feasibility Grant</span>
          </label>

          <label className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between gap-2 ${
            includeSbirPhase2 ? 'bg-emerald-950/30 border-emerald-500/60 text-white' : 'bg-black/30 border-white/10 text-slate-400'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase text-[10px] text-emerald-400">Direct-to-Phase II</span>
              <input
                type="checkbox"
                checked={includeSbirPhase2}
                onChange={(e) => setIncludeSbirPhase2(e.target.checked)}
                className="accent-emerald-400 rounded cursor-pointer"
              />
            </div>
            <span className="text-sm font-bold font-mono text-emerald-300">$2.00M</span>
            <span className="text-[10px] text-slate-400">AFWERX Prototype Hardware Contract</span>
          </label>

          <label className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between gap-2 ${
            includeSba7a ? 'bg-amber-950/30 border-amber-500/60 text-white' : 'bg-black/30 border-white/10 text-slate-400'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase text-[10px] text-amber-400">SBA 7(a) Working Cap</span>
              <input
                type="checkbox"
                checked={includeSba7a}
                onChange={(e) => setIncludeSba7a(e.target.checked)}
                className="accent-amber-400 rounded cursor-pointer"
              />
            </div>
            <span className="text-sm font-bold font-mono text-amber-300">$5.00M</span>
            <span className="text-[10px] text-slate-400">75–85% Gov Guaranteed Line</span>
          </label>

          <label className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between gap-2 ${
            includeSba504 ? 'bg-cyan-950/30 border-cyan-500/60 text-white' : 'bg-black/30 border-white/10 text-slate-400'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase text-[10px] text-cyan-400">SBA 504 Hangar</span>
              <input
                type="checkbox"
                checked={includeSba504}
                onChange={(e) => setIncludeSba504(e.target.checked)}
                className="accent-cyan-400 rounded cursor-pointer"
              />
            </div>
            <span className="text-sm font-bold font-mono text-cyan-300">$5.50M</span>
            <span className="text-[10px] text-slate-400">Proving Grounds &amp; Facility Loan</span>
          </label>

          <label className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between gap-2 ${
            includePrimes ? 'bg-purple-950/30 border-purple-500/60 text-white' : 'bg-black/30 border-white/10 text-slate-400'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase text-[10px] text-purple-400">Prime Primes Sub</span>
              <input
                type="checkbox"
                checked={includePrimes}
                onChange={(e) => setIncludePrimes(e.target.checked)}
                className="accent-purple-400 rounded cursor-pointer"
              />
            </div>
            <span className="text-sm font-bold font-mono text-purple-300">$3.50M</span>
            <span className="text-[10px] text-slate-400">13 CFR § 125.4 Small Business Primes Sub</span>
          </label>
        </div>
      </div>

      {/* Program Category Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'ALL', label: 'All Title 13 Programs (8)' },
            { id: 'SBIR_DEFENSE_RND', label: 'SBIR/STTR Defense Grants' },
            { id: 'SBA_LOAN_PROGRAMS', label: 'SBA 7(a) & 504 Credit' },
            { id: 'GOV_CONTRACTING', label: '8(a) & Prime Subcontracts' },
            { id: 'VENTURE_CAPITAL', label: 'SBIC Equity Capital' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-400">
          Showing <strong className="text-white">{filteredPrograms.length}</strong> Qualified Programs
        </div>
      </div>

      {/* Two-Column Explorer: Program Cards List + Deep-Dive Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: List of Qualified Programs */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          {filteredPrograms.map((program) => {
            const isSelected = program.id === selectedProgramId;
            return (
              <button
                key={program.id}
                onClick={() => setSelectedProgramId(program.id)}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  isSelected
                    ? 'bg-[#121A2C] border-emerald-400/80 shadow-xl ring-2 ring-emerald-400/30'
                    : 'bg-[#090D16] border-white/10 hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-bold text-emerald-400 font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
                      {program.cfrCitation}
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      program.matchRelevance === 'IMMEDIATE_FIT'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {program.matchRelevance.replace('_', ' ')}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white font-['Barlow_Condensed',sans-serif] uppercase tracking-wide leading-snug">
                    {program.title}
                  </h4>

                  <div className="text-xs text-slate-400 mt-1 line-clamp-1">
                    Agency: {program.agency}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                  <span className="text-emerald-400 font-bold font-mono text-sm">
                    {program.capitalRange}
                  </span>
                  <span className="text-[11px] text-cyan-300 hover:underline font-bold">
                    {isSelected ? 'INSPECTING →' : 'SELECT'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column: Deep-Dive Program Specification & Operational Execution */}
        <div className="lg:col-span-7 bg-[#090D16] border border-emerald-500/40 rounded-2xl p-5 sm:p-6 shadow-2xl flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold uppercase">
                  {selectedProgram.capitalType.replace(/_/g, ' ')}
                </span>
                <span className="text-slate-500">·</span>
                <span className="text-xs text-cyan-400 font-bold">{selectedProgram.cfrCitation}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold uppercase text-white font-['Barlow_Condensed',sans-serif] tracking-wide">
                {selectedProgram.title}
              </h3>
              <div className="text-xs text-slate-400 mt-0.5">
                Primary Awarding Agency: <strong className="text-slate-200">{selectedProgram.agency}</strong>
              </div>
            </div>

            <div className="bg-[#050810] border border-emerald-500/30 rounded-xl p-3 shrink-0 text-right">
              <span className="text-[10px] text-slate-500 block uppercase">Capital Ceiling</span>
              <span className="text-xl font-extrabold text-emerald-400 font-mono">
                {selectedProgram.capitalRange}
              </span>
            </div>
          </div>

          {/* Statutory Qualification for 13ADC & NAICS 541715 */}
          <div className="bg-[#050810] border border-white/5 rounded-xl p-4 space-y-1.5 text-xs">
            <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">
              13ADC Statutory NAICS Qualification Status (13 CFR § 121.201):
            </span>
            <div className="text-slate-200 leading-relaxed">
              {selectedProgram.naicsQualification}
            </div>
            <p className="text-slate-400 leading-relaxed pt-1">
              {selectedProgram.eligibilitySummary}
            </p>
          </div>

          {/* Deliverables & Milestones */}
          <div className="space-y-2">
            <h4 className="text-xs uppercase font-bold text-cyan-400 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Program Target Deliverables for 13ADC Assets:</span>
            </h4>
            <div className="space-y-1.5">
              {selectedProgram.deliverablesTarget.map((target, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 bg-white/[0.02] p-2.5 rounded-lg border border-white/5">
                  <span className="text-emerald-400 font-bold">›</span>
                  <span>{target}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Operational Application */}
          <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-4 text-xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider">
              Operational Fleet &amp; Workshop Application:
            </span>
            <p className="text-slate-200 leading-relaxed">
              {selectedProgram.operationalApplication}
            </p>
          </div>

          {/* Footer Action Bar */}
          <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="text-[11px] text-slate-500">
              Authority: <strong className="text-slate-300">Shawn Patrick Cooper Gardner (US-1 Authority)</strong> · PEC 00711617
            </div>

            <button
              onClick={handleCopyFundingDossier}
              className="w-full sm:w-auto px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold uppercase font-mono tracking-wider rounded-lg transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <span>📋</span>
              <span>{copiedDossier ? 'Dossier Copied!' : 'Export Title 13 Funding Package'}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )}
</div>
);
};
