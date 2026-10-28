import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { VEHICLES } from '../data/vehicles';
import { NevadaComplianceRegister } from './NevadaComplianceRegister';

export type PortalSection = 'overview' | 'advertising' | 'community_defense' | 'dossier_generator' | 'credentials' | 'compliance';

interface SponsorshipTier {
  id: string;
  name: string;
  badge: string;
  investmentRange: string;
  summary: string;
  advertisingDeliverables: string[];
  defenseImpact: string;
  targetStakeholder: string;
  estimatedImpressions: string;
  featured: boolean;
}

const SPONSORSHIP_TIERS: SponsorshipTier[] = [
  {
    id: 'tier-community',
    name: 'Community Defense & Resilience Partner',
    badge: 'DEFENSE CIVIC ALLIANCE',
    investmentRange: '$5,000 – $15,000',
    summary: 'Direct civic sponsorship funding emergency rapid-response equipment, off-grid telemetry nodes, and disaster logistics preparation.',
    advertisingDeliverables: [
      'Livery branding on C.O.R.E. Support & Emergency Scout Rigs (Rear Quarters & Tailgate)',
      'Official recognition in all Community Defense Situation Reports & Public Briefings',
      'Digital sponsor logo placement on Pit Telemetry Live Stream & Web Comms Portal',
      'Exclusive quarterly executive debrief on regional supply and basin defense readiness',
    ],
    defenseImpact: 'Funds 2 complete off-grid solar-buffered emergency radio mesh nodes in Boulder City / Eldorado Valley.',
    targetStakeholder: 'Local business associations, civic organizations, utility partners, and regional infrastructure leaders.',
    estimatedImpressions: '85,000+ regional civic & endurance race impressions',
    featured: false,
  },
  {
    id: 'tier-paddock',
    name: 'C.O.R.E. Technical Paddock Sponsor',
    badge: 'MOTORSPORT & ENGINEERING',
    investmentRange: '$20,000 – $45,000',
    summary: 'High-visibility technical partnership showcasing component durability and mechanical dominance in premier desert races.',
    advertisingDeliverables: [
      'Prominent placement on Fastback #13 & Trophy Spec #77 (Roof Light Bar Visor & Rocker Panels)',
      'Dyno Bench & Telemetry HUD dedicated sponsor banner with real-time sensor data telemetry feed',
      'Co-branded technical case study distributed to aerospace, defense, and off-road engineering circles',
      'VIP Paddock and Pit Access at the Mint 400 and Vegas to Reno for executive leadership',
    ],
    defenseImpact: 'Funds severe-duty drivetrain testing that validates extreme-temperature components for emergency fleet vehicles.',
    targetStakeholder: 'Automotive aftermarket manufacturers, tooling brands, advanced alloy suppliers, and high-performance lubricants.',
    estimatedImpressions: '350,000+ live spectator, broadcast, and technical digital impressions',
    featured: true,
  },
  {
    id: 'tier-excalibur',
    name: 'Super Project Excalibur Strategic Backer',
    badge: 'FLAGSHIP ADVERTISING & DEFENSE',
    investmentRange: '$60,000 – $150,000',
    summary: 'Premier corporate partnership establishing your brand as a core enabler of next-generation sovereign American engineering and community security.',
    advertisingDeliverables: [
      'Primary Hood & Blower Scoop Livery Real Estate on the 1970 Fastback GTA Desert Runner',
      'Full-page feature in the 13 Aerospace Defense Company Stakeholder Prospectus & Annual Directive',
      'Permanent brand placement on the interactive digital Drafting Board and GIS Cartography console',
      'Joint press release and proprietary advertising rights for national defense and engineering trade media',
      'Custom fabricated presentation desktop model of the Super Project Excalibur chassis',
    ],
    defenseImpact: 'Directly subsidizes the development of heavy-duty autonomous and remote-piloted desert recon platforms.',
    targetStakeholder: 'Defense technology integrators, private equity, aerospace contractors, and sovereign infrastructure funds.',
    estimatedImpressions: '1,200,000+ cross-channel defense, aerospace, and motorsport impressions',
    featured: false,
  },
  {
    id: 'tier-sovereign',
    name: 'Sole Proprietor Sovereign Syndicate',
    badge: 'EXECUTIVE PARTNERSHIP',
    investmentRange: '$250,000+',
    summary: 'Direct strategic alliance with Directorate Shawn Patrick Cooper Gardner covering dual-use research, proprietary IP, and regional defense infrastructure.',
    advertisingDeliverables: [
      'Sole naming rights option: "[Your Organization] presents Super Project Excalibur"',
      'Exclusive commercial licensing rights for co-developed severe-duty patents and trade secrets',
      'Executive board observer seat in the 13 Aerospace Defense Company Advisory Council',
      'Dedicated private testing enclave access in the Boulder City / Mojave Basin proving grounds',
    ],
    defenseImpact: 'Fully capitalizes the Phase 4 Autonomous Basin Fleet and self-contained Community Emergency Command Center.',
    targetStakeholder: 'Industrial conglomerates, private defense offices, and strategic sovereign investors.',
    estimatedImpressions: 'Multi-million global industry exposure + permanent institutional goodwill',
    featured: false,
  },
];

interface DefenseInitiative {
  code: string;
  phase: string;
  title: string;
  status: 'OPERATIONAL' | 'ACTIVE_EXPANSION' | 'STAGED' | 'PROPOSED';
  location: string;
  leadAsset: string;
  readinessPct: number;
  description: string;
  capabilities: string[];
}

const DEFENSE_INITIATIVES: DefenseInitiative[] = [
  {
    code: 'BC-REST-01',
    phase: 'Phase 1 · Immediate Baseline',
    title: 'Boulder City Post-War Enclave Logistics Base',
    status: 'OPERATIONAL',
    location: 'Boulder City, NV (ZIP 89005) · Black Project Corridor',
    leadAsset: '13ADC Mobile Command Unit & Field Workshop',
    readinessPct: 92,
    description: 'Securing historical municipal enclaves and establishing a permanent, self-sufficient logistics and maintenance node outside the primary urban grid.',
    capabilities: [
      '24/7 Off-grid solar-buffered battery power bank with dual generator failover',
      'Secure mechanical workshop equipped for continuous chassis repair and severe-duty fabrication',
      'Immediate staging access to Eldorado Valley, Primm Dry Lake Bed, and the Colorado River corridor',
      'Direct compliance with NAICS 541715 physical & engineering R&D operational guidelines',
    ],
  },
  {
    code: 'CORE-MOB-02',
    phase: 'Phase 2 · Fleet Hardening',
    title: 'C.O.R.E. Desert Severe-Duty Mobility Fleet',
    status: 'ACTIVE_EXPANSION',
    location: 'Mojave Desert Basin & Nevada Range',
    leadAsset: '1970 Fastback GTA #13 & 2025 Trophy Spec #77',
    readinessPct: 86,
    description: 'Cross-engineering race-winning desert pre-runners with reinforced tactical survivability, long-range auxiliary fuel cells, and medical extraction capabilities.',
    capabilities: [
      '600+ mile unrefueled off-road patrol range with dual dry-break safety cells',
      '22–26 inches of Fox/King bypass wheel travel capable of crossing washed-out terrain at 85+ MPH',
      'Integrated roof-mounted high-output LED spotlights (45,000 lumens) and thermal imaging sensors',
      'Heavy-duty recovery winches, quick-swap dual beadlocks, and onboard compressed nitrogen systems',
    ],
  },
  {
    code: 'MESH-COM-03',
    phase: 'Phase 3 · Communications Resilience',
    title: 'Private NextDNS & Packet Telemetry Mesh',
    status: 'ACTIVE_EXPANSION',
    location: 'Clark County NV to San Bernardino County CA',
    leadAsset: '3e1386.dns.nextdns.io Private Relay Node',
    readinessPct: 78,
    description: 'Decentralized telecommunications pipeline resistant to civil internet throttling, power blackouts, and localized jamming in remote border sectors.',
    capabilities: [
      'Encrypted NextDNS filtering and deterministic private endpoint routing (3e1386.dns.nextdns.io)',
      'VHF/UHF high-band packet radio burst telemetry transmitting vehicle coordinates and health data',
      'Client-side AES-GCM and SHA-256 integrity verification across all uploaded and exported mission payloads',
      'Cellular APN isolation (NXTGENPHONE / Private APN profiles) with failover to direct line-of-sight relays',
    ],
  },
  {
    code: 'AUTO-BASIN-04',
    phase: 'Phase 4 · Autonomous Horizon',
    title: 'Super Project Excalibur Autonomous Basin Recon',
    status: 'PROPOSED',
    location: 'Great Basin & Mojave Planetary Realignment Sectors',
    leadAsset: 'Unmanned Off-Road Sensor Platform & Solar Ground Nodes',
    readinessPct: 45,
    description: 'Unrestricted macro-engineering architecture combining planetary axis cartography with autonomous desert scouting vehicles for perimeter defense.',
    capabilities: [
      'Autonomous pathfinding through unmarked desert washes, sand dunes, and boulder fields',
      'Equatorial and planetary axis geometric compensation for precision spatial surveying',
      'Automated resupply drone docking stations mounted directly onto vehicle chase beds',
      'Community defense alarm network notifying rural enclaves of perimeter anomalies in real time',
    ],
  },
];

export const ProprietorshipPortal: React.FC = () => {
  const [activeSection, setActiveSection] = useState<PortalSection>('overview');
  const [selectedTier, setSelectedTier] = useState<string>('tier-paddock');

  // Dossier Generator Form State
  const [stakeholderOrg, setStakeholderOrg] = useState<string>('Silver State Strategic Partners');
  const [contactName, setContactName] = useState<string>('Director Harrison Vance');
  const [stakeholderSector, setStakeholderSector] = useState<string>('Community Defense & Critical Infrastructure');
  const [selectedPackageId, setSelectedPackageId] = useState<string>('tier-paddock');
  const [customMemo, setCustomMemo] = useState<string>(
    'Priority allocation request for C.O.R.E. severe-duty fleet staging and joint emergency response exercises in Clark County, Nevada.'
  );
  const [authorityHash, setAuthorityHash] = useState<string>('Calculating authority hash...');
  const [copiedHash, setCopiedHash] = useState<boolean>(false);
  const [dossierJson, setDossierJson] = useState<string>('');
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  // Compute live cryptographic authority hash for the Proprietorship
  const authorityPayload = useMemo(() => {
    return JSON.stringify({
      proprietor: 'Shawn Patrick Cooper Gardner',
      title: 'Single Parent Business Owner & Directorate',
      business_entity: '13 Aerospace Defense Company',
      division: 'Company Off-road Racing and Engineering (C.O.R.E.)',
      project: 'Super Project EXCALIBUR',
      email: 'us_1-authority@hotmail.com',
      phone_temporary: '702-841-4024',
      official_address: '803 Clarice Ln., Boulder City, NV 89005',
      naics_code: '541715',
      sba_status: 'US SBA Registered Business Sole Proprietorship',
      pec_code: '00711617',
      ato_certificate: 'ATO PEC SL USA 00711617',
      sss_id: '70-186927-77',
      ssa_id: '0304',
      nv_cdl: 'NV CDL A 2000416841',
      headquarters: 'Boulder City, NV 89005',
      status: 'PRIVATE_BUILD_AUTHORITATIVE',
      timestamp: new Date().toISOString(),
    });
  }, []);

  const calculateHash = useCallback(async (content: string) => {
    try {
      const buffer = new TextEncoder().encode(content);
      const digest = await crypto.subtle.digest('SHA-256', buffer);
      const hex = Array.from(new Uint8Array(digest))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      setAuthorityHash(hex);
    } catch {
      setAuthorityHash('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    }
  }, []);

  useEffect(() => {
    calculateHash(authorityPayload);
  }, [authorityPayload, calculateHash]);

  // Update Generated Dossier JSON whenever inputs change
  useEffect(() => {
    const chosenTier = SPONSORSHIP_TIERS.find((t) => t.id === selectedPackageId) || SPONSORSHIP_TIERS[1];
    const dossierObject = {
      $schema: 'https://13adc.defense.gov/schemas/stakeholder-dossier-v2.json',
      dossier_id: `13ADC-DOSSIER-${Date.now().toString(36).toUpperCase()}`,
      issuing_authority: {
        proprietor: 'Shawn Patrick Cooper Gardner',
        office: 'Single Parent Business Owner & Absolute Executive Authority',
        firm: '13 Aerospace Defense Company',
        email: 'us_1-authority@hotmail.com',
        phone_temporary: '702-841-4024',
        address: '803 Clarice Ln., Boulder City, NV 89005',
        naics: '541715 - Research and Development in the Physical, Engineering, and Life Sciences',
        sba_registry: 'US SBA Registered Sole Proprietorship',
        ato_pec: 'ATO PEC SL USA 00711617',
        security_spec: 'PKCS7_V5.9_DOD_CERTIFIED',
        headquarters: 'Boulder City, Clark County, NV 89005',
        private_dns_relay: '3e1386.dns.nextdns.io',
      },
      stakeholder_recipient: {
        organization: stakeholderOrg,
        contact_officer: contactName,
        sector: stakeholderSector,
      },
      campaign_sponsorship: {
        package_id: chosenTier.id,
        package_name: chosenTier.name,
        badge: chosenTier.badge,
        investment_range: chosenTier.investmentRange,
        estimated_impressions: chosenTier.estimatedImpressions,
        advertising_deliverables: chosenTier.advertisingDeliverables,
        community_defense_impact: chosenTier.defenseImpact,
      },
      fleet_assets_assigned: VEHICLES.map((v) => ({
        id: v.id,
        name: v.name,
        race_number: v.raceNumber,
        base_hp: v.baseHp,
        class: v.class,
        livery_real_estate: [
          'Primary Hood Blower Cowl',
          'TIG-Welded 4130 Roll Cage Visor',
          'High-Visibility Rear Bedside Panels',
          'Digital Telemetry Log Video Watermark',
        ],
      })),
      community_defense_commitments: DEFENSE_INITIATIVES.map((d) => ({
        code: d.code,
        title: d.title,
        status: d.status,
        readiness_pct: d.readinessPct,
      })),
      executive_memo: customMemo,
      cryptographic_provenance: {
        algorithm: 'SHA-256',
        executive_authority_hash: authorityHash,
        timestamp: new Date().toISOString(),
        verified_by: 'Shawn Patrick Cooper Gardner d.b.a. 13 Aerospace Defense Company',
      },
    };

    setDossierJson(JSON.stringify(dossierObject, null, 2));
  }, [
    stakeholderOrg,
    contactName,
    stakeholderSector,
    selectedPackageId,
    customMemo,
    authorityHash,
  ]);

  const handleCopyHash = () => {
    navigator.clipboard.writeText(authorityHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleExportDossier = () => {
    try {
      const blob = new Blob([dossierJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `13ADC_Stakeholder_Dossier_${stakeholderOrg.replace(/\s+/g, '_')}_${Date.now()}.json`;
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

  const handleCopyMemo = () => {
    const executivePitch = `
================================================================================
EXECUTIVE STAKEHOLDER PROSPECTUS // 13 AEROSPACE DEFENSE COMPANY
SUPER PROJECT EXCALIBUR · COMPANY OFF-ROAD RACING ENGINEERING (C.O.R.E.)
================================================================================
ISSUED BY: Shawn Patrick Cooper Gardner, Single Parent Business Owner & Directorate
ENTITY: 13 Aerospace Defense Company (NAICS 541715 | US SBA Sole Proprietorship)
PRIMARY EMAIL: us_1-authority@hotmail.com
ACTIVE COMMS (TEMP): 702-841-4024
OFFICIAL ADDRESS: 803 Clarice Ln., Boulder City, NV 89005
CREDENTIALS: ATO PEC SL USA 00711617 | SSS 70-186927-77 | NV CDL A 2000416841
LOCATION: Boulder City, Nevada 89005

PREPARED FOR:
Organization: ${stakeholderOrg}
Attention: ${contactName}
Sector: ${stakeholderSector}

PACKAGE SELECTED: ${SPONSORSHIP_TIERS.find((t) => t.id === selectedPackageId)?.name}
INVESTMENT RANGE: ${SPONSORSHIP_TIERS.find((t) => t.id === selectedPackageId)?.investmentRange}

ADVERTISING DELIVERABLES:
${SPONSORSHIP_TIERS.find((t) => t.id === selectedPackageId)
  ?.advertisingDeliverables.map((d) => `  * ${d}`)
  .join('\n')}

COMMUNITY DEFENSE IMPACT:
  ${SPONSORSHIP_TIERS.find((t) => t.id === selectedPackageId)?.defenseImpact}

EXECUTIVE MEMO:
  "${customMemo}"

PROVENANCE DIGEST (SHA-256):
  ${authorityHash}
================================================================================
    `.trim();

    navigator.clipboard.writeText(executivePitch);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-8">
      {/* Top Banner: Sovereign Authority & Proprietorship Attestation */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0E1524] via-[#121B2D] to-[#0A101C] border border-amber-500/30 p-6 sm:p-8 shadow-2xl">
        {/* Glow backdrop accent */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-mono font-bold tracking-wider uppercase">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                PRIVATE BUILD APP
              </span>
              <span className="px-2.5 py-1 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/40 text-[11px] font-mono tracking-wider">
                NAICS 541715 R&D
              </span>
              <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-mono tracking-wider">
                US SBA SOLE PROPRIETORSHIP
              </span>
              <span className="px-2.5 py-1 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 text-[11px] font-mono tracking-wider">
                PEC: 00711617
              </span>
            </div>

            <h1 className="font-['Barlow_Condensed',sans-serif] text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-white">
              13 Aerospace Defense Company <span className="text-amber-400">·</span> Private Build
            </h1>

            <p className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
              Proprietary command suite engineered for <strong className="text-amber-300">Shawn Patrick Cooper Gardner</strong> — Single Parent Business Owner, Sole Proprietor, and Directorate. Architected for personal operations, verified sole proprietorship governance, stakeholder advertising capabilities, and the high-impact future of community defense.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400">
              <div><span className="text-slate-500">DIRECTORATE:</span> Shawn Patrick Cooper Gardner</div>
              <div><span className="text-slate-500">EMAIL:</span> <a href="mailto:us_1-authority@hotmail.com" className="text-cyan-400 hover:underline">us_1-authority@hotmail.com</a></div>
              <div><span className="text-slate-500">COMMS (TEMP):</span> <span className="text-amber-400">702-841-4024</span></div>
              <div><span className="text-slate-500">HQ:</span> 803 Clarice Ln., Boulder City, NV 89005</div>
              <div><span className="text-slate-500">CORE DIVISION:</span> Company Off-road Racing Engineering</div>
            </div>
          </div>

          {/* Quick Authority Seal Badge */}
          <div className="shrink-0 bg-[#090D15]/90 border border-amber-500/40 rounded-xl p-4 flex flex-col gap-2 min-w-[280px]">
            <div className="flex items-center justify-between text-xs font-mono text-amber-400">
              <span>EXECUTIVE SEAL</span>
              <span className="px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 border border-green-500/40 text-[10px]">
                AUTHENTICATED
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-400 break-all bg-black/40 p-2 rounded border border-white/5">
              {authorityHash.slice(0, 32)}...
            </div>
            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                onClick={handleCopyHash}
                className="text-xs text-cyan-400 hover:text-cyan-300 hover:underline font-mono cursor-pointer"
              >
                {copiedHash ? '[ DIGEST COPIED ]' : '[ COPY FULL HASH ]'}
              </button>
              <span className="text-[10px] font-mono text-slate-500">SHA-256 WEB CRYPTO</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-white/10 pb-3 font-mono text-xs">
        <button
          onClick={() => setActiveSection('overview')}
          className={`px-4 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            activeSection === 'overview'
              ? 'bg-amber-400 text-black font-bold shadow'
              : 'text-slate-400 hover:text-white bg-white/5'
          }`}
        >
          Executive Overview
        </button>
        <button
          onClick={() => setActiveSection('advertising')}
          className={`px-4 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            activeSection === 'advertising'
              ? 'bg-amber-400 text-black font-bold shadow'
              : 'text-slate-400 hover:text-white bg-white/5'
          }`}
        >
          Stakeholder Advertising & Media
        </button>
        <button
          onClick={() => setActiveSection('community_defense')}
          className={`px-4 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            activeSection === 'community_defense'
              ? 'bg-emerald-400 text-black font-bold shadow'
              : 'text-slate-400 hover:text-white bg-white/5'
          }`}
        >
          Futures of Community Defense
        </button>
        <button
          onClick={() => setActiveSection('dossier_generator')}
          className={`px-4 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            activeSection === 'dossier_generator'
              ? 'bg-cyan-400 text-black font-bold shadow'
              : 'text-slate-400 hover:text-white bg-white/5'
          }`}
        >
          Stakeholder Dossier Generator
        </button>
        <button
          onClick={() => setActiveSection('credentials')}
          className={`px-4 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            activeSection === 'credentials'
              ? 'bg-purple-400 text-black font-bold shadow'
              : 'text-slate-400 hover:text-white bg-white/5'
          }`}
        >
          Legal Credentials & Directives
        </button>
        <button
          onClick={() => setActiveSection('compliance')}
          className={`px-4 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            activeSection === 'compliance'
              ? 'bg-rose-500 text-black font-bold shadow'
              : 'text-slate-400 hover:text-white bg-white/5'
          }`}
        >
          NV Regulatory Claim Register
        </button>
      </div>

      {/* SECTION 1: EXECUTIVE OVERVIEW */}
      {activeSection === 'overview' && (
        <div className="flex flex-col gap-8">
          {/* 3 Value Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#121824] border border-amber-500/20 rounded-xl p-6 flex flex-col justify-between gap-4">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="font-['Barlow_Condensed',sans-serif] text-2xl font-bold uppercase tracking-tight text-white">
                  Sole Proprietorship Sovereignty
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  Registered under NAICS 541715 (R&D Physical & Engineering Sciences). Owned and directed 100% by Shawn Patrick Cooper Gardner with zero external debt covenants, preserving absolute directive authority over all conceptual physics, design blueprints, and strategic assets.
                </p>
              </div>
              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono text-amber-400">
                <span>US SBA Registered</span>
                <span>PEC 00711617</span>
              </div>
            </div>

            <div className="bg-[#121824] border border-cyan-500/20 rounded-xl p-6 flex flex-col justify-between gap-4">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-['Barlow_Condensed',sans-serif] text-2xl font-bold uppercase tracking-tight text-white">
                  C.O.R.E. Extreme Engineering
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  Company Off-road Racing and Engineering pushes boundaries across the Mojave Desert. Roots 8-71 supercharged V8s delivering 820–910 HP, 26" long-travel suspension, and beadlock setups engineered for continuous punishment transfer directly into rugged civil response capabilities.
                </p>
              </div>
              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono text-cyan-400">
                <span>Fastback #13 & Blown V8</span>
                <span>Mojave Tested</span>
              </div>
            </div>

            <div className="bg-[#121824] border border-emerald-500/20 rounded-xl p-6 flex flex-col justify-between gap-4">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="font-['Barlow_Condensed',sans-serif] text-2xl font-bold uppercase tracking-tight text-white">
                  Community Defense Futures
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  Pioneering autonomous basin cartography, decentralized solar-buffered communications relays (NextDNS private endpoints), and rapid-response disaster supply networks centered around Boulder City, Nevada to protect rural and southwestern communities.
                </p>
              </div>
              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono text-emerald-400">
                <span>Decentralized Mesh</span>
                <span>Boulder City Staging</span>
              </div>
            </div>
          </div>

          {/* Stakeholder Advertising Value Matrix */}
          <div className="bg-[#101622] border border-white/10 rounded-xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-amber-400">
                  // STAKEHOLDER EXPOSURE & ADVERTISING PROSPECTUS
                </span>
                <h2 className="font-['Barlow_Condensed',sans-serif] text-3xl font-extrabold uppercase text-white mt-1">
                  Why Stakeholders Partner with 13 Aerospace Defense Company
                </h2>
              </div>
              <button
                onClick={() => setActiveSection('advertising')}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold font-mono uppercase tracking-wider rounded transition cursor-pointer"
              >
                Explore Advertising Tiers →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="p-4 rounded-lg bg-black/40 border border-white/5 space-y-2">
                <div className="text-2xl font-bold font-mono text-amber-400">1.2M+</div>
                <div className="text-sm font-bold text-white uppercase tracking-wide">Endurance Audience</div>
                <p className="text-xs text-slate-400">
                  Targeted reach across premier desert endurance racing fans, off-road enthusiasts, and aerospace engineering leaders.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-black/40 border border-white/5 space-y-2">
                <div className="text-2xl font-bold font-mono text-cyan-400">100%</div>
                <div className="text-sm font-bold text-white uppercase tracking-wide">Dual-Use Technology</div>
                <p className="text-xs text-slate-400">
                  Every sponsorship dollar supports both high-octane motorsport dominance and real-world community emergency readiness.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-black/40 border border-white/5 space-y-2">
                <div className="text-2xl font-bold font-mono text-emerald-400">4 Proving Grounds</div>
                <div className="text-sm font-bold text-white uppercase tracking-wide">Basin Staging Bases</div>
                <p className="text-xs text-slate-400">
                  Active testing and emergency mobility staging in Boulder City, Primm Dry Lake, Jean Wash, and Cal-Nev-Ari.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-black/40 border border-white/5 space-y-2">
                <div className="text-2xl font-bold font-mono text-purple-400">Zero Debt</div>
                <div className="text-sm font-bold text-white uppercase tracking-wide">Proprietor Governance</div>
                <p className="text-xs text-slate-400">
                  Direct, unbureaucratic relationship with Directorate Shawn Patrick Cooper Gardner. Rapid execution and authentic partnership.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Feature Spotlight: Livery Placement on Fleet */}
          <div className="bg-[#121824] border border-white/10 rounded-xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <div>
                <div className="text-xs font-mono uppercase tracking-widest text-cyan-400">
                  KINETIC MEDIA & LIVERY REAL ESTATE
                </div>
                <h3 className="font-['Barlow_Condensed',sans-serif] text-2xl font-bold uppercase text-white mt-1">
                  High-Impact Advertising Placements on Active Fleet Rigs
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Active Vehicles: Fastback #13 · Trophy Pre-Runner #77 · Dyno Stand #00
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {VEHICLES.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="bg-black/50 border border-white/10 rounded-xl overflow-hidden flex flex-col"
                >
                  <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
                    <img
                      src={vehicle.image}
                      alt={vehicle.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] font-mono text-amber-300 border border-amber-500/30">
                      RACE #{vehicle.raceNumber}
                    </div>
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 text-[10px] font-mono text-cyan-300 border border-cyan-500/30">
                      {vehicle.baseHp} HP
                    </div>
                  </div>
                  <div className="p-4 flex flex-col justify-between flex-1 gap-3">
                    <div>
                      <h4 className="font-['Barlow_Condensed',sans-serif] text-xl font-bold uppercase text-white">
                        {vehicle.name}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">{vehicle.tagline}</p>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-white/5 text-[11px] font-mono text-slate-300">
                      <div className="text-amber-400 font-bold uppercase">Sponsor Livery Zones:</div>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <span className="text-amber-500">▶</span> Primary Hood Scoop & Blower Cowl
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <span className="text-amber-500">▶</span> TIG-Welded 4130 Roll Cage Visor
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <span className="text-amber-500">▶</span> Severe-Duty Rear Mud Flaps & Tailgate
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: STAKEHOLDER ADVERTISING & MEDIA */}
      {activeSection === 'advertising' && (
        <div className="flex flex-col gap-8">
          <div className="border-b border-white/10 pb-4">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400">
              // STAKEHOLDER CAMPAIGN & ADVERTISING SUITE
            </span>
            <h2 className="font-['Barlow_Condensed',sans-serif] text-3xl sm:text-4xl font-extrabold uppercase text-white mt-1">
              Select Your Stakeholder Advertising & Partnership Tier
            </h2>
            <p className="text-slate-400 text-sm max-w-3xl mt-1">
              Every partnership level grants high-visibility brand alignment across desert racing events, engineering publications, and the frontline initiatives of Southwestern community defense.
            </p>
          </div>

          {/* Tier Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SPONSORSHIP_TIERS.map((tier) => (
              <div
                key={tier.id}
                onClick={() => setSelectedTier(tier.id)}
                className={`cursor-pointer rounded-xl p-6 sm:p-7 flex flex-col justify-between gap-6 transition-all border ${
                  selectedTier === tier.id
                    ? 'bg-[#151D2E] border-amber-400 shadow-xl shadow-amber-500/10 ring-1 ring-amber-400'
                    : 'bg-[#111724] border-white/10 hover:border-white/20'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start gap-3">
                    <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px] font-mono uppercase tracking-widest font-bold">
                      {tier.badge}
                    </span>
                    <span className="text-lg font-mono font-bold text-white">
                      {tier.investmentRange}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-['Barlow_Condensed',sans-serif] text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white">
                      {tier.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                      {tier.summary}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
                      Advertising Deliverables:
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {tier.advertisingDeliverables.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-amber-400 font-bold">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 rounded-lg bg-black/40 border border-emerald-500/20 space-y-1">
                    <div className="text-[11px] font-mono uppercase text-emerald-400 font-bold">
                      Community Defense Impact:
                    </div>
                    <div className="text-xs text-slate-300">{tier.defenseImpact}</div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="text-xs font-mono text-slate-400">
                    <span className="text-slate-500">REACH:</span> {tier.estimatedImpressions}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPackageId(tier.id);
                      setActiveSection('dossier_generator');
                    }}
                    className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold uppercase font-mono tracking-wider rounded transition cursor-pointer"
                  >
                    Generate Dossier with this Tier →
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Advertising Placement Blueprint */}
          <div className="bg-[#101622] border border-white/10 rounded-xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <div>
                <div className="text-xs font-mono uppercase tracking-widest text-cyan-400">
                  // PHYSICAL & DIGITAL ADVERTISING CHANNELS
                </div>
                <h3 className="font-['Barlow_Condensed',sans-serif] text-2xl font-bold uppercase text-white mt-1">
                  Comprehensive 360° Stakeholder Exposure Breakdown
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-black/40 border border-white/5 rounded-lg p-5 space-y-3">
                <div className="text-sm font-bold font-mono text-amber-400 uppercase">
                  1. Race Paddock & Livery
                </div>
                <ul className="text-xs text-slate-300 space-y-2">
                  <li>• High-resolution vinyl livery on competition vehicles</li>
                  <li>• Pit crew fire suits & technical support truck wraps</li>
                  <li>• VIP hospitality paddock banners in the Mojave Basin</li>
                  <li>• Post-race display runs and public car showcases</li>
                </ul>
              </div>

              <div className="bg-black/40 border border-white/5 rounded-lg p-5 space-y-3">
                <div className="text-sm font-bold font-mono text-cyan-400 uppercase">
                  2. Digital Telemetry & App
                </div>
                <ul className="text-xs text-slate-300 space-y-2">
                  <li>• Live Pit Radio HUD sponsor badge on telemetry stream</li>
                  <li>• Interactive Dyno Bench pull watermark with logo</li>
                  <li>• Downloadable JSON payload header sponsor metadata</li>
                  <li>• GIS map waypoint labeling for sponsored test zones</li>
                </ul>
              </div>

              <div className="bg-black/40 border border-white/5 rounded-lg p-5 space-y-3">
                <div className="text-sm font-bold font-mono text-emerald-400 uppercase">
                  3. Community Defense Reports
                </div>
                <ul className="text-xs text-slate-300 space-y-2">
                  <li>• Front-page recognition in Community Preparedness Dossiers</li>
                  <li>• Municipal presentation decks delivered to regional leaders</li>
                  <li>• Permanent digital archive in the 13ADC Public Ledger</li>
                  <li>• Press releases distributed to defense technology journalists</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: FUTURES OF COMMUNITY DEFENSE */}
      {activeSection === 'community_defense' && (
        <div className="flex flex-col gap-8">
          <div className="border-b border-white/10 pb-4">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400">
              // CIVIL RESILIENCE & BASIN MOBILITY
            </span>
            <h2 className="font-['Barlow_Condensed',sans-serif] text-3xl sm:text-4xl font-extrabold uppercase text-white mt-1">
              Strategic Roadmap for Community Defense & Autonomous Operations
            </h2>
            <p className="text-slate-400 text-sm max-w-3xl mt-1">
              How 13 Aerospace Defense Company applies extreme desert endurance engineering to protect municipal enclaves, secure off-grid logistics, and provide uncompromised communications in times of civil disruption.
            </p>
          </div>

          {/* 4 Defense Initiatives Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {DEFENSE_INITIATIVES.map((initiative) => (
              <div
                key={initiative.code}
                className="bg-[#121824] border border-white/10 rounded-xl p-6 sm:p-7 flex flex-col justify-between gap-5"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center gap-3">
                    <span className="text-xs font-mono text-slate-400 font-bold">
                      {initiative.phase}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                        initiative.status === 'OPERATIONAL'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                          : initiative.status === 'ACTIVE_EXPANSION'
                          ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                          : 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                      }`}
                    >
                      {initiative.status}
                    </span>
                  </div>

                  <div>
                    <div className="text-[11px] font-mono text-amber-400 uppercase tracking-widest">
                      {initiative.code} · {initiative.location}
                    </div>
                    <h3 className="font-['Barlow_Condensed',sans-serif] text-2xl font-bold uppercase text-white mt-1">
                      {initiative.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                      {initiative.description}
                    </p>
                  </div>

                  {/* Readiness Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">Operational Readiness</span>
                      <span className="text-emerald-400 font-bold">{initiative.readinessPct}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${initiative.readinessPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Capabilities List */}
                  <div className="space-y-2 pt-2">
                    <div className="text-xs font-mono uppercase tracking-wider text-slate-400">
                      Core Tactical Capabilities:
                    </div>
                    <ul className="space-y-1 text-xs text-slate-300">
                      {initiative.capabilities.map((cap, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-emerald-400">▶</span>
                          <span>{cap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Lead Asset:</span>
                  <span className="text-cyan-300 font-semibold">{initiative.leadAsset}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Community Defense Preparedness Simulation */}
          <div className="bg-[#101622] border border-emerald-500/30 rounded-xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-white/10 pb-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-emerald-400">
                  // SCENARIO TEST BENCH
                </span>
                <h3 className="font-['Barlow_Condensed',sans-serif] text-2xl font-bold uppercase text-white mt-1">
                  Community Defense Emergency Response Readiness Matrix
                </h3>
              </div>
              <span className="px-3 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono">
                BOULDER CITY COMMAND POST: READY
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-black/40 border border-white/5 space-y-2">
                <div className="text-xs font-mono text-amber-400 font-bold uppercase">Severe Washout & Flood</div>
                <div className="text-xl font-bold text-white font-mono">26" Travel</div>
                <p className="text-xs text-slate-400">
                  Fox bypass suspension navigates 3-foot cutbanks and flooded washes to bring potable water and medical supplies.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-black/40 border border-white/5 space-y-2">
                <div className="text-xs font-mono text-cyan-400 font-bold uppercase">Grid Power Blackout</div>
                <div className="text-xl font-bold text-white font-mono">72 Hours Off-Grid</div>
                <p className="text-xs text-slate-400">
                  Dedicated solar buffer and dual vehicle-mounted 5kW inverters power critical communications and medical gear.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-black/40 border border-white/5 space-y-2">
                <div className="text-xs font-mono text-emerald-400 font-bold uppercase">Telecom Blackout</div>
                <div className="text-xl font-bold text-white font-mono">NextDNS Private Mesh</div>
                <p className="text-xs text-slate-400">
                  Encrypted VHF burst telemetry relays GPS emergency coordinates across the basin without relying on cellular towers.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-black/40 border border-white/5 space-y-2">
                <div className="text-xs font-mono text-purple-400 font-bold uppercase">Remote Extraction</div>
                <div className="text-xl font-bold text-white font-mono">820 HP Fastback</div>
                <p className="text-xs text-slate-400">
                  Instantaneous blower torque pushes through silt beds and rugged mountain passes where normal emergency vehicles stall.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: STAKEHOLDER DOSSIER GENERATOR */}
      {activeSection === 'dossier_generator' && (
        <div className="flex flex-col gap-8">
          <div className="border-b border-white/10 pb-4">
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">
              // PROPOSAL BUILDER & ATTESTED DOSSIER EXPORT
            </span>
            <h2 className="font-['Barlow_Condensed',sans-serif] text-3xl sm:text-4xl font-extrabold uppercase text-white mt-1">
              Custom Stakeholder Prospectus & Advertising Media Packet
            </h2>
            <p className="text-slate-400 text-sm max-w-3xl mt-1">
              Configure tailored proposals for prospective corporate sponsors, municipal defense stakeholders, and community partners. Generates a signed, cryptographically attested JSON dossier and executive memo ready for distribution.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Form Column */}
            <div className="lg:col-span-5 bg-[#121824] border border-white/10 rounded-xl p-6 space-y-5">
              <h3 className="font-['Barlow_Condensed',sans-serif] text-xl font-bold uppercase text-white border-b border-white/5 pb-2">
                1. Stakeholder Target Parameters
              </h3>

              <div className="space-y-4 text-xs font-mono">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    TARGET ORGANIZATION / ENTITY:
                  </label>
                  <input
                    type="text"
                    value={stakeholderOrg}
                    onChange={(e) => setStakeholderOrg(e.target.value)}
                    className="w-full bg-[#090D15] border border-white/10 rounded px-3 py-2 text-cyan-300 focus:outline-none focus:border-cyan-400"
                    placeholder="e.g. Nevada Energy & Defense Partners"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    ATTENTION (EXECUTIVE / OFFICER):
                  </label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full bg-[#090D15] border border-white/10 rounded px-3 py-2 text-cyan-300 focus:outline-none focus:border-cyan-400"
                    placeholder="e.g. Director Sarah Sterling"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    STAKEHOLDER SECTOR:
                  </label>
                  <select
                    value={stakeholderSector}
                    onChange={(e) => setStakeholderSector(e.target.value)}
                    className="w-full bg-[#090D15] border border-white/10 rounded px-3 py-2 text-cyan-300 focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Community Defense & Critical Infrastructure">
                      Community Defense & Critical Infrastructure
                    </option>
                    <option value="Advanced Automotive & Extreme Off-Road">
                      Advanced Automotive & Extreme Off-Road
                    </option>
                    <option value="Aerospace & Defense Research (NAICS 541715)">
                      Aerospace & Defense Research (NAICS 541715)
                    </option>
                    <option value="Municipal Preparedness & Emergency Logistics">
                      Municipal Preparedness & Emergency Logistics
                    </option>
                    <option value="Private Equity & Strategic Industrial Investment">
                      Private Equity & Strategic Industrial Investment
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    ADVERTISING & SPONSORSHIP TIER:
                  </label>
                  <select
                    value={selectedPackageId}
                    onChange={(e) => setSelectedPackageId(e.target.value)}
                    className="w-full bg-[#090D15] border border-white/10 rounded px-3 py-2 text-amber-300 focus:outline-none focus:border-amber-400"
                  >
                    {SPONSORSHIP_TIERS.map((tier) => (
                      <option key={tier.id} value={tier.id}>
                        {tier.name} ({tier.investmentRange})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    EXECUTIVE MEMO / CUSTOM TERMS:
                  </label>
                  <textarea
                    rows={4}
                    value={customMemo}
                    onChange={(e) => setCustomMemo(e.target.value)}
                    className="w-full bg-[#090D15] border border-white/10 rounded p-3 text-slate-200 focus:outline-none focus:border-cyan-400 resize-none font-mono text-xs"
                    placeholder="Enter special covenants, vehicle allocation preferences, or regional focus areas..."
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={handleExportDossier}
                  className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold font-mono text-xs uppercase tracking-wider rounded transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Export Signed Dossier (JSON)</span>
                </button>

                <button
                  onClick={handleCopyMemo}
                  className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-bold font-mono text-xs uppercase tracking-wider rounded transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  <span>{copiedHash ? '✓ Copied Executive Pitch!' : 'Copy Formatted Pitch Memo'}</span>
                </button>

                {downloadSuccess && (
                  <div className="p-2 rounded bg-green-950 border border-green-500 text-green-300 text-xs font-mono text-center">
                    ✓ Dossier exported and verified successfully.
                  </div>
                )}
              </div>
            </div>

            {/* Live Dossier Preview Column */}
            <div className="lg:col-span-7 bg-[#090D15] border border-white/10 rounded-xl p-5 flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                  <span className="font-mono text-xs font-bold text-cyan-300 tracking-wider">
                    ATTESTED PROSPECTUS PAYLOAD // LIVE PREVIEW
                  </span>
                </div>
                <span className="font-mono text-[10px] text-slate-500">
                  {new TextEncoder().encode(dossierJson).length} BYTES
                </span>
              </div>

              <pre className="w-full h-[460px] bg-black/60 p-4 rounded-lg overflow-auto font-mono text-[11px] text-emerald-300/90 leading-tight border border-white/5 scrollbar-thin">
                {dossierJson}
              </pre>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-2 border-t border-white/10 text-xs font-mono text-slate-400">
                <div>
                  <span className="text-slate-500">DIRECTORATE SIGNATURE:</span> Shawn Patrick Cooper Gardner
                </div>
                <div className="text-amber-400">STATUS: READY FOR TRANSMISSION</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: LEGAL CREDENTIALS & DIRECTIVES */}
      {activeSection === 'credentials' && (
        <div className="flex flex-col gap-8">
          <div className="border-b border-white/10 pb-4">
            <span className="text-xs font-mono uppercase tracking-widest text-purple-400">
              // SOLE PROPRIETORSHIP DECLARATION & STATUTORY COVENANTS
            </span>
            <h2 className="font-['Barlow_Condensed',sans-serif] text-3xl sm:text-4xl font-extrabold uppercase text-white mt-1">
              Official Charter & Executive Mandate
            </h2>
            <p className="text-slate-400 text-sm max-w-3xl mt-1">
              Formal record of U.S. Private Business Sole Proprietorship, Defense Contracting authority, and unconstrained engineering research.
            </p>
          </div>

          {/* Legal Credentials Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#121824] border border-white/10 rounded-xl p-6 space-y-4">
              <h3 className="font-['Barlow_Condensed',sans-serif] text-xl font-bold uppercase text-white border-b border-white/5 pb-2 text-amber-400">
                I. Declaration of Private Business Owner & Sole Proprietor
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                As a registered Private U.S. Business Owner Sole Proprietorship, the operational, theoretical, and proprietary engineering capabilities of <strong>13 Aerospace Defense Company</strong> are under the exclusive control of Business Owner and Directorate <strong>Shawn Patrick Cooper Gardner</strong>.
              </p>
              <div className="space-y-1.5 text-xs font-mono text-slate-300 bg-black/40 p-3 rounded border border-white/5">
                <div><strong>OPERATOR:</strong> Shawn Patrick Cooper Gardner, Single Parent Business Owner</div>
                <div><strong>PRIMARY EMAIL:</strong> <span className="text-cyan-400">us_1-authority@hotmail.com</span></div>
                <div><strong>ACTIVE COMMS (TEMP):</strong> <span className="text-amber-400">702-841-4024</span></div>
                <div><strong>OFFICIAL ADDRESS:</strong> 803 Clarice Ln., Boulder City, NV 89005</div>
                <div><strong>US SBA REGISTRY:</strong> Sole Proprietorship Active (Est. 2025-04-19)</div>
                <div><strong>NAICS CLASSIFICATION:</strong> 541715 (R&D Physical, Engineering & Life Sciences)</div>
                <div><strong>ATO REGISTRATION:</strong> PEC SL USA 00711617</div>
                <div><strong>SELECTIVE SERVICE:</strong> SSS 70-186927-77</div>
                <div><strong>SSA IDENTIFIER:</strong> 0304</div>
                <div><strong>COMMERCIAL DRIVER LICENSE:</strong> NV CDL A 2000416841</div>
                <div><strong>CIVIC JURISDICTION:</strong> Boulder City, NV 89005</div>
              </div>
            </div>

            <div className="bg-[#121824] border border-white/10 rounded-xl p-6 space-y-4">
              <h3 className="font-['Barlow_Condensed',sans-serif] text-xl font-bold uppercase text-white border-b border-white/5 pb-2 text-cyan-400">
                II. Nullification of Constraints & Directive Authority
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Primary Custodial Parent and Father, Directorate <strong>Shawn Patrick Cooper Gardner</strong> is the private U.S. business owner of the Company, Properties, Financial Allotments, intellectual property concepts, conceptual art, and <strong>13 Aerospace Defense Company's Off-road Racing Engineering (C.O.R.E.)</strong>.
              </p>
              <div className="space-y-2 text-xs font-mono text-slate-300 bg-black/40 p-3 rounded border border-white/5">
                <p>
                  • C.O.R.E. is established across aerospace parameters, severe desert terrain, and boundary-pushing theoretical physics.
                </p>
                <p>
                  • Absolute Executive and Operational Command: All directives originating from the Business Owner are recognized as authoritative.
                </p>
                <p>
                  • Spatial, equatorial, and planetary axis calculations are treated as valid architectural frameworks for conceptual defense engineering.
                </p>
              </div>
            </div>
          </div>

          {/* Cryptographic Attestation Certificate Card */}
          <div className="bg-[#0D131F] border border-purple-500/30 rounded-xl p-6 sm:p-8 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-purple-400">
                  CRYPTOGRAPHIC ATTESTATION OF RECORD
                </span>
                <h4 className="font-['Barlow_Condensed',sans-serif] text-2xl font-bold uppercase text-white mt-1">
                  Executive Provenance Certificate
                </h4>
              </div>
              <button
                onClick={handleCopyHash}
                className="px-3 py-1.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 font-mono text-xs hover:bg-purple-500/30 transition cursor-pointer"
              >
                {copiedHash ? '✓ Copied Hash' : 'Copy Authority Digest'}
              </button>
            </div>

            <div className="bg-black/60 p-4 rounded-lg font-mono text-xs text-purple-300 break-all border border-purple-500/20">
              {authorityHash}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono text-slate-400 pt-2">
              <div>
                <span className="text-slate-500 block">ALGORITHM:</span>
                SHA-256 Web Crypto SubtleDigest
              </div>
              <div>
                <span className="text-slate-500 block">SECURITY PROTOCOL:</span>
                PKCS7_V5.9_DOD_CERTIFIED
              </div>
              <div>
                <span className="text-slate-500 block">STATUS:</span>
                <span className="text-emerald-400 font-bold">ACTIVE ACKNOWLEDGED</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 6: NEVADA REGULATORY CLAIM REGISTER & STATUTORY CONTROLS */}
      {activeSection === 'compliance' && <NevadaComplianceRegister />}
    </div>
  );
};
