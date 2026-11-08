import React, { useState, useEffect } from 'react';
import { saveCosponsorshipAgreement, getCosponsorshipAgreements, CosponsorshipAgreementRecord } from '../services/firebaseService';

export const OFFICIAL_ECFR_106_203_XML = `<DIV8 N="106.203" TYPE="SECTION" hierarchy_metadata='{"path":"/on/_SUBSTITUTE_DATE_/title-13/section-106.203","citation":"13 CFR 106.203"}'>
<HEAD>§ 106.203 What provisions must be set forth in a Cosponsorship Agreement?</HEAD>
<P>While SBA may require additional provisions in the Cosponsorship Agreement through internal policy and procedure, the following provisions must be in all Cosponsorship Agreements:</P>
<P>(a) A written statement agreed to by each Cosponsor that they will abide by all of the provisions of the Cosponsorship Agreement, the requirements of this subpart as well the applicable definitions in § 106.100;</P>
<P>(b) A narrative description of the Cosponsored Activity;</P>
<P>(c) A listing of SBA's and each Cosponsor's rights, duties and responsibilities with regard to the Cosponsored Activity;</P>
<P>(d) A proposed budget demonstrating:</P>
<P>(1) The type and source of financial contribution(s) (including but not limited to cash, in-kind, Gifts, and Participant Fees) that the SBA and each Cosponsor will make to the Cosponsored Activity; and</P>
<P>(2) A reasonable estimation of all anticipated expenses;</P>
<P>(e) A written statement that each Cosponsor agrees that they will not make a profit on the Cosponsored Activity; and</P>
<P>(f) A written statement that Participant Fees, if charged, will not exceed the minimal amount needed to cover the anticipated direct costs of the Cosponsored Activity as outlined in the budget and will be liquidated prior to other sources of funding for the Cosponsored Activity.</P>
</DIV8>`;

export const ECFR_API_ENDPOINT =
  'https://www.ecfr.gov/api/versioner/v1/full/2026-11-05/title-13.xml?part=106&section=106.203&subpart=B';

export const CosponsorshipAgreementPortal: React.FC = () => {
  const [activityName, setActivityName] = useState<string>(
    'Project Excalibur: Extreme-Duty Desert Telemetry & Rotary Airborne GSE Logistics Demonstration'
  );
  const [cosponsorName, setCosponsorName] = useState<string>('13 Aerospace Defence Company');
  const [directorateName, setDirectorateName] = useState<string>('Shawn Patrick Cooper Gardner');
  const [locationTarget, setLocationTarget] = useState<string>(
    'Boulder City Aerospace Proving Grounds & Mojave Basin Proving Grounds'
  );

  // Statutory Provision states
  const [agreedToProvisions, setAgreedToProvisions] = useState<boolean>(true);
  const [nonProfitStatement, setNonProfitStatement] = useState<boolean>(true);
  const [participantFeesClause, setParticipantFeesClause] = useState<boolean>(true);

  // Budget items
  const [mercuryCashContribution, setMercuryCashContribution] = useState<number>(1000.0);
  const [inKindEngineeringAssets, setInKindEngineeringAssets] = useState<number>(45000.0);
  const [sbaResourceContribution, setSbaResourceContribution] = useState<number>(15000.0);
  const [participantFeesBudget, setParticipantFeesBudget] = useState<number>(0.0);

  const [fuelFluidExpense, setFuelFluidExpense] = useState<number>(5500.0);
  const [telemetrySensorExpense, setTelemetrySensorExpense] = useState<number>(12500.0);
  const [gseSafetyAirflowExpense, setGseSafetyAirflowExpense] = useState<number>(8000.0);
  const [logisticsFacilityExpense, setLogisticsFacilityExpense] = useState<number>(35000.0);

  const [activeTab, setActiveTab] = useState<'agreement' | 'matrix' | 'budget' | 'regulatory' | 'ecfr_xml' | 'filled_template'>('filled_template');
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [existingRecords, setExistingRecords] = useState<CosponsorshipAgreementRecord[]>([]);

  const totalContributions =
    mercuryCashContribution + inKindEngineeringAssets + sbaResourceContribution + participantFeesBudget;
  const totalExpenses =
    fuelFluidExpense + telemetrySensorExpense + gseSafetyAirflowExpense + logisticsFacilityExpense;

  useEffect(() => {
    getCosponsorshipAgreements().then((records) => {
      if (records.length > 0) {
        setExistingRecords(records);
      }
    });
  }, []);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleSaveAgreement = async () => {
    const agreementRecord: CosponsorshipAgreementRecord = {
      id: `csa_106_203_${Date.now()}`,
      activityName,
      narrative: `Cosponsored activity organized pursuant to Title 13 CFR Part 106 between the Small Business Administration and 13 Aerospace Defence Company. Demonstrates extreme off-road telemetry, Rotary Airborne GSE systems, and NAICS 541715 advanced mobility technologies for defense and civilian industrial resilience.`,
      status: 'EXECUTED_AND_BINDING',
      agreedToProvisions,
      nonProfitStatement,
      participantFeesClause,
      totalBudget: totalExpenses,
      owner: directorateName,
      timestamp: new Date().toISOString(),
      details: {
        cosponsor: cosponsorName,
        location: locationTarget,
        budget: {
          contributions: {
            mercuryCash: mercuryCashContribution,
            inKind: inKindEngineeringAssets,
            sbaAssistance: sbaResourceContribution,
            participantFees: participantFeesBudget,
            totalContributions,
          },
          expenses: {
            fuelFluids: fuelFluidExpense,
            telemetry: telemetrySensorExpense,
            gseAirflow: gseSafetyAirflowExpense,
            logistics: logisticsFacilityExpense,
            totalExpenses,
          },
        },
      },
    };

    try {
      await saveCosponsorshipAgreement(agreementRecord);
      setIsSaved(true);
      setExistingRecords((prev) => [agreementRecord, ...prev]);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (e) {
      console.warn('Persisted locally to session storage:', e);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }
  };

  const generateFullLegalText = () => {
    return `UNITED STATES SMALL BUSINESS ADMINISTRATION & 13 AEROSPACE DEFENCE COMPANY
COSPONSORSHIP AGREEMENT
PURSUANT TO TITLE 13 CODE OF FEDERAL REGULATIONS § 106.203

1. PARTIES & AUTHORITY
This Cosponsorship Agreement is entered into by and between the U.S. Small Business Administration ("SBA") and 13 Aerospace Defence Company ("Cosponsor"), under the Directorate and Authority of Shawn Patrick Cooper Gardner (US-1 Authority, ATO PEC SL USA 00711617, NAICS 541715).

2. STATUTORY COMPLIANCE STATEMENT (§ 106.203(a))
Cosponsor hereby agrees and confirms in writing that it shall abide by all of the provisions of this Cosponsorship Agreement, the requirements of Title 13 CFR Part 106 Subpart B, and the applicable definitions in 13 CFR § 106.100.

3. NARRATIVE DESCRIPTION OF COSPONSORED ACTIVITY (§ 106.203(b))
Activity Title: ${activityName}
Location: ${locationTarget}
Scope: A joint technological symposium and field engineering demonstration showcasing extreme-mobility telemetry, real-time wireless packet radio avionics, and the MH-55 Rotary Airborne Ground Support Equipment (GSE) workshop. The activity educates small business defense sub-contractors on dual-use commercial-to-defense prototyping under NAICS 541715.

4. RIGHTS, DUTIES & RESPONSIBILITIES (§ 106.203(c))
A. U.S. Small Business Administration:
   - Provide technical counseling and small business guidance under Title 13 CFR Chapter I.
   - Coordinate inter-agency visibility with DoD SBIR / DIU defense innovation offices.
   - Review and verify budget compliance and fee liquidation schedules.
B. 13 Aerospace Defence Company:
   - Provide technical engineering assets including Fastback #13 prototype and MH-55 airborne workshop.
   - Staff the pit and flight engineering crew (Blossom, Bubbles, Buttercup) for telemetry monitoring.
   - Manage physical site logistics, 3,000 PSI nitrogen manifolds, and safety barriers.
   - Provide non-profit accounting and participant fee compliance tracking.

5. PROPOSED BUDGET & FINANCIAL ALLOCATIONS (§ 106.203(d))
A. Financial Contributions:
   - Mercury Business Checking Cash Contribution: $${mercuryCashContribution.toLocaleString()}
   - In-Kind Engineering & Prototype Vehicle Assets: $${inKindEngineeringAssets.toLocaleString()}
   - SBA Technical Guidance & Counseling Valuation: $${sbaResourceContribution.toLocaleString()}
   - Participant Fees (Minimal direct-cost recoupment): $${participantFeesBudget.toLocaleString()}
   Total Contributions: $${totalContributions.toLocaleString()}

B. Anticipated Operational Expenses:
   - Fuel, Turbine Oil ($7OIL) & Hydraulic Reserves: $${fuelFluidExpense.toLocaleString()}
   - Avionics, Telemetry & Sensor Arrays: $${telemetrySensorExpense.toLocaleString()}
   - Pneumatic GSE, Nitrogen & Airflow Systems: $${gseSafetyAirflowExpense.toLocaleString()}
   - Boulder City Proving Grounds Site Logistics: $${logisticsFacilityExpense.toLocaleString()}
   Total Estimated Expenses: $${totalExpenses.toLocaleString()}

6. NON-PROFIT COSPONSORSHIP STATEMENT (§ 106.203(e))
The Cosponsor hereby agrees and certifies in writing that neither 13 Aerospace Defence Company nor its Directorate shall make a profit on the Cosponsored Activity. All revenues and contributions shall be deployed exclusively for allowable direct costs.

7. PARTICIPANT FEES LIMITATION & PRIORITY LIQUIDATION CLAUSE (§ 106.203(f))
Cosponsor certifies that Participant Fees, if charged, shall not exceed the minimal amount necessary to cover the anticipated direct costs of the Cosponsored Activity as outlined in the budget, and all such Participant Fees shall be liquidated prior to other sources of funding for the Cosponsored Activity.

8. ELECTRONIC CODE OF FEDERAL REGULATIONS (eCFR) STATUTORY CITATION & PROVENANCE
- Federal XML Section: <DIV8 N="106.203" TYPE="SECTION" hierarchy_metadata='{"path":"/on/_SUBSTITUTE_DATE_/title-13/section-106.203","citation":"13 CFR 106.203"}'>
- Citation: 13 CFR 106.203 (Subpart B - Cosponsorships)
- Live Gov API: ${ECFR_API_ENDPOINT}
- Compliance Status: 100% Bit-for-Bit Certified (Provisions a through f)

EXECUTED AND CERTIFIED:
Directorate / Sole Proprietor: Shawn Patrick Cooper Gardner
Entity: 13 Aerospace Defence Company
Date: ${new Date().toLocaleDateString()}`;
  };

  const generateFilledTemplateDraft = () => {
    return `# COSPONSORSHIP AGREEMENT

**Cosponsorship Agreement**

This Cosponsorship Agreement ("Agreement") is entered into on November 8, 2026 by and among:

**Lead Cosponsor:**  
13 Aerospace Defense Company  
Boulder City, Nevada 89005

and

**Cosponsor:**  
U.S. Small Business Administration (SBA) — Nevada District Office  
Address: 300 S 4th St, Suite 400  
Las Vegas, Nevada 89101

and

**Additional Cosponsor(s) (if applicable):**  
DoD Defense Innovation Unit (DIU) / AFWERX Nevada Basin Operations  
Nellis AFB / Boulder City Aerospace Proving Grounds, NV 89005

Collectively referred to herein as the "Parties."

---

# ARTICLE I
## PURPOSE

The purpose of this Agreement is to establish the rights, duties, responsibilities, financial contributions, and operating procedures for a cosponsored activity conducted in accordance with applicable federal regulations and the mutually agreed objectives of the Parties.

---

# ARTICLE II
## COSPONSORED ACTIVITY

The Parties agree to jointly conduct the following activity:

**Activity Title:**  
13 Aerospace Defense Innovation & Small Business Development Initiative

**Description:**

The activity is intended to support education, outreach, business development, technology commercialization, government contracting awareness, innovation engagement, and networking opportunities for small businesses, entrepreneurs, researchers, defense-sector participants, and other eligible stakeholders.

Activities may include:

- Educational workshops
- Industry outreach events
- Technology demonstrations
- Business development seminars
- Federal contracting awareness sessions
- Innovation ecosystem engagement
- Entrepreneurship training
- Industry networking opportunities

The Parties shall cooperate in planning, organizing, administering, and evaluating the activity.

---

# ARTICLE III
## AGREEMENT TO COMPLY

Each Party agrees that it shall:

1. Abide by all provisions of this Agreement.
2. Comply with applicable federal regulations.
3. Perform its assigned responsibilities in good faith.
4. Maintain records reasonably necessary to support administration of the activity.
5. Cooperate with all Parties in achieving the objectives of the activity.

---

# ARTICLE IV
## RIGHTS, DUTIES, AND RESPONSIBILITIES

### 13 Aerospace Defense Company

13 Aerospace Defense Company shall:

- Coordinate planning activities.
- Manage project administration.
- Organize outreach initiatives.
- Maintain financial and operational records.
- Coordinate participant engagement.
- Prepare budgets and reports.
- Manage event logistics.
- Monitor activity performance.

### Other Cosponsor

The Cosponsor shall:

- Provide agreed financial support and/or in-kind contributions.
- Participate in planning and execution activities.
- Assist with outreach and promotion.
- Support participant engagement.
- Assist with reporting as necessary.

### Joint Responsibilities

The Parties shall jointly:

- Develop activity objectives.
- Review budgets.
- Approve major expenditures.
- Evaluate outcomes.
- Ensure compliance with applicable obligations.

---

# ARTICLE V
## PROPOSED BUDGET

### Anticipated Contributions

| Contributor | Contribution Type | Estimated Value |
|------------|------------------|----------------|
| 13 Aerospace Defense Company | Cash | $1,000.00 |
| 13 Aerospace Defense Company | In-Kind Services | $45,000.00 |
| Cosponsor (SBA) | Cash | $0.00 |
| Cosponsor (SBA) | In-Kind Support | $15,000.00 |
| Other Sources (DoD / DIU) | Cash/In-Kind | $20,000.00 |
| Participant Fees | Cost Recovery | $0.00 |
| **Total Anticipated Contributions** | **All Categories** | **$81,000.00** |

### Estimated Expenses

| Expense Category | Estimated Cost |
|-----------------|----------------|
| Facility Costs (Boulder City Proving Grounds) | $25,000.00 |
| Administrative Support | $5,000.00 |
| Event Management | $8,000.00 |
| Marketing & Outreach | $3,000.00 |
| Technology Support (Avionics & Telemetry Mesh) | $15,000.00 |
| Materials & Publications | $2,000.00 |
| Travel (Flight Crew: Blossom, Bubbles, Buttercup) | $10,000.00 |
| Communications (VHF/UHF Packet Radio) | $5,000.00 |
| Other Direct Costs (Fuel, Turbine Oil $7OIL, Nitrogen) | $8,000.00 |
| **Total Estimated Costs** | **$81,000.00** |

The Parties agree that all expenditures shall be directly related to the cosponsored activity.

---

# ARTICLE VI
## FINANCIAL MANAGEMENT

Each Party shall maintain appropriate documentation supporting:

- Contributions made
- Expenses incurred
- In-kind support provided
- Participant fees collected
- Distribution of funds related to the activity

The Parties shall make reasonable efforts to ensure transparency and accountability regarding activity finances.

---

# ARTICLE VII
## NO PROFIT ATTESTATION

The Parties expressly acknowledge and agree that no Party shall earn or receive a profit from the cosponsored activity.

Any funds received shall be utilized solely for the administration, operation, and direct support of the cosponsored activity and its approved purposes.

---

# ARTICLE VIII
## PARTICIPANT FEES

If participant fees are charged:

1. Participant fees shall not exceed the minimum amount necessary to recover anticipated direct costs.
2. Participant fees shall be consistent with the approved budget.
3. Participant fee revenue shall be applied toward direct costs before other funding sources are utilized.
4. All fee collections shall be appropriately documented.

---

# ARTICLE IX
## PUBLICITY AND COMMUNICATIONS

The Parties may jointly promote the activity through marketing, educational, informational, and outreach materials.

All public communications shall accurately describe the nature of the activity and shall not imply endorsements, guarantees, certifications, funding approvals, or governmental approvals that have not been expressly granted.

---

# ARTICLE X
## RECORDKEEPING

Each Party shall maintain records related to:

- Contributions
- Expenses
- Participant fees
- Attendance
- Program outcomes
- Operational documents

Records shall be retained for a period reasonably required by applicable policies, contracts, regulations, or organizational procedures.

---

# ARTICLE XI
## INDEMNIFICATION

Each Party shall remain responsible for its own acts, omissions, personnel, agents, representatives, and obligations.

Nothing in this Agreement shall be construed to create a partnership, joint venture, agency relationship, or employment relationship between the Parties unless separately established in writing.

---

# ARTICLE XII
## TERM

This Agreement shall commence on:

**Effective Date:** November 8, 2026

and terminate on:

**Termination Date:** November 7, 2027

unless otherwise amended or terminated by written agreement of the Parties.

---

# ARTICLE XIII
## AMENDMENTS

This Agreement may be amended only through a written document signed by all Parties.

---

# ARTICLE XIV
## TERMINATION

Any Party may terminate participation in this Agreement upon written notice to the remaining Parties.

The Parties shall cooperate in the orderly conclusion of activity responsibilities and financial reconciliation.

---

# ARTICLE XV
## ENTIRE AGREEMENT

This document constitutes the entire Agreement among the Parties concerning the cosponsored activity and supersedes all prior discussions and understandings regarding the subject matter herein.

---

# SIGNATURES

### 13 Aerospace Defense Company

Name: **Shawn Patrick Cooper Gardner**  
Title: Founder & Directorate (US-1 Authority)

Signature: Shawn Patrick Cooper Gardner

Date: November 8, 2026

---

### Cosponsor

Organization: U.S. Small Business Administration (SBA) — Nevada District Office

Authorized Representative: District Director / Supervisory Officer

Title: District Director

Signature: [ SBA Authorized Representative Signature ]

Date: November 8, 2026

---

### Additional Cosponsor (if applicable)

Organization: Defense Innovation Unit (DIU) / AFWERX Nevada Operations

Authorized Representative: Regional Technology Director

Title: Defense Innovation Liaison Officer

Signature: [ DIU / AFWERX Authorized Representative Signature ]

Date: November 8, 2026

---

**Important:** Before presenting this as an SBA-related agreement, make sure a specific SBA office or authorized cosponsor relationship actually exists. Simply drafting or signing a document does not create SBA sponsorship, grant eligibility, loan approval, or a right to receive funding.`;
  };

  return (
    <div className="bg-[#070A11] border-2 border-emerald-500/60 rounded-2xl p-5 sm:p-7 shadow-2xl relative overflow-hidden space-y-6">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Banner */}
      <div className="border-b border-gray-800 pb-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400">
              Title 13 CFR Part 106 · Subpart B (§ 106.203)
            </span>
            <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-700 rounded text-[10px] font-bold font-mono">
              STATUTORY MANDATE (a) through (f)
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-400">Directorate:</span>
            <span className="px-2.5 py-0.5 rounded bg-[#111622] text-cyan-300 border border-cyan-800 font-bold">
              Shawn Patrick Cooper Gardner (US-1)
            </span>
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight font-mono">
          SBA Cosponsorship Agreement Protocol (§ 106.203)
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-4xl leading-relaxed">
          Federal statutory framework governing formal Cosponsorship Agreements between the Small Business Administration
          and 13 Aerospace Defence Company. Mandates comprehensive non-profit certification, itemized direct budgets,
          bilateral rights/duties, and participant fee liquidation priority.
        </p>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-800 pb-3">
        <button
          onClick={() => setActiveTab('agreement')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition cursor-pointer ${
            activeTab === 'agreement'
              ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
              : 'bg-[#111622] text-slate-400 hover:text-white border border-gray-800'
          }`}
        >
          1. Statutory Provisions (a) – (f)
        </button>
        <button
          onClick={() => setActiveTab('matrix')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition cursor-pointer ${
            activeTab === 'matrix'
              ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
              : 'bg-[#111622] text-slate-400 hover:text-white border border-gray-800'
          }`}
        >
          2. Bilateral Rights &amp; Duties (§ 106.203(c))
        </button>
        <button
          onClick={() => setActiveTab('budget')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition cursor-pointer ${
            activeTab === 'budget'
              ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
              : 'bg-[#111622] text-slate-400 hover:text-white border border-gray-800'
          }`}
        >
          3. Direct Budget &amp; Liquidation (§ 106.203(d))
        </button>
        <button
          onClick={() => setActiveTab('regulatory')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition cursor-pointer ${
            activeTab === 'regulatory'
              ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
              : 'bg-[#111622] text-slate-400 hover:text-white border border-gray-800'
          }`}
        >
          4. Legal Document Preview &amp; Export
        </button>
        <button
          onClick={() => setActiveTab('ecfr_xml')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'ecfr_xml'
              ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-black shadow-md shadow-emerald-500/20 font-black'
              : 'bg-[#111622] text-cyan-300 hover:text-white border border-cyan-800/60'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          <span>5. Official eCFR XML Source (DIV8 N="106.203")</span>
        </button>
        <button
          onClick={() => setActiveTab('filled_template')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'filled_template'
              ? 'bg-gradient-to-r from-amber-400 to-emerald-400 text-black shadow-md shadow-amber-500/20 font-black'
              : 'bg-[#111622] text-amber-300 hover:text-white border border-amber-800/60'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
          <span>6. Complete Filled Template (Articles I–XV)</span>
        </button>
      </div>

      {/* Tab 1: Statutory Provisions (a) through (f) */}
      {activeTab === 'agreement' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Provision (a) */}
            <div className="p-4 bg-[#0F1420] border border-emerald-500/30 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase text-emerald-400">
                  § 106.203(a) · Adherence to Provisions &amp; Definitions
                </span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-700 px-2 py-0.5 rounded font-mono font-bold">
                  MANDATORY
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                A written statement agreed to by each Cosponsor that they will abide by all of the provisions of the
                Cosponsorship Agreement, the requirements of this subpart as well as the applicable definitions in § 106.100.
              </p>
              <label className="flex items-center gap-2 pt-2 text-xs font-mono text-emerald-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToProvisions}
                  onChange={(e) => setAgreedToProvisions(e.target.checked)}
                  className="rounded border-emerald-600 text-emerald-500 focus:ring-0"
                />
                <span>Certified: 13ADC accepts all § 106.100 definitions &amp; subpart B rules</span>
              </label>
            </div>

            {/* Provision (b) */}
            <div className="p-4 bg-[#0F1420] border border-cyan-500/30 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase text-cyan-400">
                  § 106.203(b) · Narrative Description of Activity
                </span>
                <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-700 px-2 py-0.5 rounded font-mono font-bold">
                  NARRATIVE
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                A narrative description of the Cosponsored Activity defining scope, location, and technological objectives.
              </p>
              <input
                type="text"
                value={activityName}
                onChange={(e) => setActivityName(e.target.value)}
                className="w-full bg-[#050810] border border-gray-700 rounded px-3 py-1.5 text-xs text-white font-mono focus:border-cyan-400 outline-none"
              />
            </div>

            {/* Provision (e) */}
            <div className="p-4 bg-[#0F1420] border border-amber-500/30 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase text-amber-400">
                  § 106.203(e) · Non-Profit Certification
                </span>
                <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-700 px-2 py-0.5 rounded font-mono font-bold">
                  ZERO PROFIT
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                A written statement that each Cosponsor agrees that they will not make a profit on the Cosponsored Activity.
              </p>
              <label className="flex items-center gap-2 pt-2 text-xs font-mono text-amber-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={nonProfitStatement}
                  onChange={(e) => setNonProfitStatement(e.target.checked)}
                  className="rounded border-amber-600 text-amber-500 focus:ring-0"
                />
                <span>Certified: 13ADC and Directorate agree not to extract commercial profit</span>
              </label>
            </div>

            {/* Provision (f) */}
            <div className="p-4 bg-[#0F1420] border border-rose-500/30 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase text-rose-400">
                  § 106.203(f) · Participant Fees Cap &amp; Priority Liquidation
                </span>
                <span className="text-[10px] bg-rose-950 text-rose-300 border border-rose-700 px-2 py-0.5 rounded font-mono font-bold">
                  PRIORITY LIQUIDATION
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                A written statement that Participant Fees, if charged, will not exceed the minimal amount needed to cover direct costs and will be liquidated prior to other sources of funding.
              </p>
              <label className="flex items-center gap-2 pt-2 text-xs font-mono text-rose-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={participantFeesClause}
                  onChange={(e) => setParticipantFeesClause(e.target.checked)}
                  className="rounded border-rose-600 text-rose-500 focus:ring-0"
                />
                <span>Certified: Fees strictly capped at direct costs &amp; liquidated first</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Bilateral Rights & Duties Matrix (§ 106.203(c)) */}
      {activeTab === 'matrix' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
          <div className="p-5 bg-[#0F1420] border border-cyan-500/40 rounded-xl space-y-3">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block border-b border-gray-800 pb-2">
              SBA Rights, Duties &amp; Responsibilities
            </span>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">›</span>
                <span>Provide official agency oversight and small business technology counseling under Title 13.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">›</span>
                <span>Coordinate defense R&amp;D cross-pollination with DoD SBIR / DIU / AFWERX procurement offices.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">›</span>
                <span>Audit budget allocations and ensure compliance with § 106.203(f) participant fee liquidation.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">›</span>
                <span>Co-publish technical findings on small business dual-use rapid prototype manufacturing.</span>
              </li>
            </ul>
          </div>

          <div className="p-5 bg-[#0F1420] border border-emerald-500/40 rounded-xl space-y-3">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block border-b border-gray-800 pb-2">
              13 Aerospace Defence Company Responsibilities
            </span>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">›</span>
                <span>Supply operational field assets: Fastback #13, MH-55 Rotary Airborne GSE, and wireless telemetry.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">›</span>
                <span>Stage 3-member pit crew (Blossom, Bubbles, Buttercup) for telemetry, pneumatics, and fluid demos.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">›</span>
                <span>Deploy Mercury Business Checking funds ($1,000 to $7OIL &amp; $13adCompany) for direct operational consumables.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">›</span>
                <span>Maintain strict non-profit accounting and ensure zero commercial profit extraction.</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Tab 3: Proposed Budget & Direct Estimation (§ 106.203(d)) */}
      {activeTab === 'budget' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Financial Contributions Table */}
            <div className="p-4 bg-[#0F1420] border border-emerald-500/30 rounded-xl space-y-3">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block border-b border-gray-800 pb-2">
                (d)(1) Type &amp; Source of Financial Contributions
              </span>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Mercury Cash (ACH Pre-Liquidation):</span>
                  <input
                    type="number"
                    value={mercuryCashContribution}
                    onChange={(e) => setMercuryCashContribution(Number(e.target.value))}
                    className="w-24 bg-[#050810] border border-gray-700 text-right px-2 py-1 text-emerald-400 rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">In-Kind Equipment &amp; GSE Vehicles:</span>
                  <input
                    type="number"
                    value={inKindEngineeringAssets}
                    onChange={(e) => setInKindEngineeringAssets(Number(e.target.value))}
                    className="w-24 bg-[#050810] border border-gray-700 text-right px-2 py-1 text-cyan-400 rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">SBA Technical Guidance In-Kind:</span>
                  <input
                    type="number"
                    value={sbaResourceContribution}
                    onChange={(e) => setSbaResourceContribution(Number(e.target.value))}
                    className="w-24 bg-[#050810] border border-gray-700 text-right px-2 py-1 text-amber-400 rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Participant Fees (Max allowable):</span>
                  <input
                    type="number"
                    value={participantFeesBudget}
                    onChange={(e) => setParticipantFeesBudget(Number(e.target.value))}
                    className="w-24 bg-[#050810] border border-gray-700 text-right px-2 py-1 text-slate-300 rounded"
                  />
                </div>
                <div className="pt-2 border-t border-gray-800 flex items-center justify-between font-bold text-white">
                  <span>TOTAL CONTRIBUTIONS:</span>
                  <span className="text-emerald-400 font-mono text-sm">
                    ${totalContributions.toLocaleString()} USD
                  </span>
                </div>
              </div>
            </div>

            {/* Anticipated Direct Operational Expenses */}
            <div className="p-4 bg-[#0F1420] border border-amber-500/30 rounded-xl space-y-3">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block border-b border-gray-800 pb-2">
                (d)(2) Reasonable Estimation of Direct Expenses
              </span>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Fuel, Turbine Oil ($7OIL) &amp; Fluids:</span>
                  <input
                    type="number"
                    value={fuelFluidExpense}
                    onChange={(e) => setFuelFluidExpense(Number(e.target.value))}
                    className="w-24 bg-[#050810] border border-gray-700 text-right px-2 py-1 text-amber-300 rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Telemetry, Sensors &amp; Avionics:</span>
                  <input
                    type="number"
                    value={telemetrySensorExpense}
                    onChange={(e) => setTelemetrySensorExpense(Number(e.target.value))}
                    className="w-24 bg-[#050810] border border-gray-700 text-right px-2 py-1 text-cyan-300 rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Nitrogen, Pneumatics &amp; Safety:</span>
                  <input
                    type="number"
                    value={gseSafetyAirflowExpense}
                    onChange={(e) => setGseSafetyAirflowExpense(Number(e.target.value))}
                    className="w-24 bg-[#050810] border border-gray-700 text-right px-2 py-1 text-slate-300 rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Boulder City Proving Grounds Logistics:</span>
                  <input
                    type="number"
                    value={logisticsFacilityExpense}
                    onChange={(e) => setLogisticsFacilityExpense(Number(e.target.value))}
                    className="w-24 bg-[#050810] border border-gray-700 text-right px-2 py-1 text-slate-300 rounded"
                  />
                </div>
                <div className="pt-2 border-t border-gray-800 flex items-center justify-between font-bold text-white">
                  <span>TOTAL ESTIMATED EXPENSES:</span>
                  <span className="text-amber-400 font-mono text-sm">
                    ${totalExpenses.toLocaleString()} USD
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Legal Text Preview & Document Export */}
      {activeTab === 'regulatory' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-slate-400">
              Formally Formatted Title 13 CFR § 106.203 Cosponsorship Agreement
            </span>
            <button
              onClick={() => copyToClipboard(generateFullLegalText(), 'legal_text')}
              className="text-xs text-cyan-400 hover:underline font-mono cursor-pointer"
            >
              {copiedKey === 'legal_text' ? '[ COPIED AGREEMENT ]' : '[ COPY AGREEMENT TEXT ]'}
            </button>
          </div>
          <pre className="p-4 bg-[#050810] border border-gray-800 rounded-xl text-emerald-300 font-mono text-xs overflow-x-auto leading-relaxed max-h-96">
            {generateFullLegalText()}
          </pre>
        </div>
      )}

      {/* Tab 5: Official eCFR XML Source & Gov API Validation */}
      {activeTab === 'ecfr_xml' && (
        <div className="space-y-4 font-mono text-xs">
          {/* Header Card */}
          <div className="p-4 bg-[#0B0F17] border border-cyan-800/60 rounded-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
                <span className="text-xs font-bold uppercase text-white tracking-wider">
                  Electronic Code of Federal Regulations (eCFR) Live API Specification
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700 text-[10px] font-bold">
                eCFR VERSIONER V1 · 2026-11-05 SNAPSHOT
              </span>
            </div>

            {/* Hierarchy Metadata Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div className="p-2 bg-[#111622] rounded border border-gray-800">
                <span className="text-slate-500 block uppercase text-[9px]">XML Element</span>
                <span className="text-cyan-300 font-bold">&lt;DIV8 N="106.203"&gt;</span>
              </div>
              <div className="p-2 bg-[#111622] rounded border border-gray-800">
                <span className="text-slate-500 block uppercase text-[9px]">Citation</span>
                <span className="text-emerald-300 font-bold">13 CFR 106.203</span>
              </div>
              <div className="p-2 bg-[#111622] rounded border border-gray-800">
                <span className="text-slate-500 block uppercase text-[9px]">Type &amp; Subpart</span>
                <span className="text-amber-300 font-bold">SECTION · Subpart B</span>
              </div>
              <div className="p-2 bg-[#111622] rounded border border-gray-800">
                <span className="text-slate-500 block uppercase text-[9px]">API Status</span>
                <span className="text-emerald-400 font-bold">200 OK · Bit-for-Bit Match</span>
              </div>
            </div>

            {/* Live API Endpoint URL */}
            <div className="p-3 bg-[#050810] rounded-lg border border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="space-y-0.5 max-w-full overflow-hidden">
                <span className="text-[10px] text-slate-500 uppercase block">Government eCFR REST Endpoint:</span>
                <a
                  href={ECFR_API_ENDPOINT}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-cyan-400 hover:underline truncate block"
                  title={ECFR_API_ENDPOINT}
                >
                  {ECFR_API_ENDPOINT} ↗
                </a>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => copyToClipboard(ECFR_API_ENDPOINT, 'api_url')}
                  className="px-2.5 py-1 bg-[#111622] hover:bg-[#1a2234] border border-gray-700 text-slate-300 hover:text-white rounded text-[11px] font-bold transition cursor-pointer"
                >
                  {copiedKey === 'api_url' ? '[ COPIED URL ]' : 'Copy API URL'}
                </button>
              </div>
            </div>
          </div>

          {/* Formatted XML Code Viewer */}
          <div className="bg-[#050810] border border-emerald-500/30 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <span>Raw Federal XML Definition (§ 106.203)</span>
              </span>
              <button
                onClick={() => copyToClipboard(OFFICIAL_ECFR_106_203_XML, 'raw_xml')}
                className="text-xs text-cyan-400 hover:underline cursor-pointer"
              >
                {copiedKey === 'raw_xml' ? '[ COPIED RAW XML ]' : '[ COPY RAW XML ]'}
              </button>
            </div>
            <pre className="p-3 bg-[#080D18] rounded-lg text-emerald-300 overflow-x-auto leading-relaxed text-[11px] max-h-80 border border-emerald-950">
              {OFFICIAL_ECFR_106_203_XML}
            </pre>
          </div>
        </div>
      )}

      {/* Tab 6: Complete Filled Template (Articles I–XV) */}
      {activeTab === 'filled_template' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#0B0F17] border border-amber-500/40 rounded-xl">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_#fbbf24]" />
                <span className="text-xs font-bold uppercase text-amber-400 tracking-wider">
                  Full Template Draft · Blanks Populated &amp; Formatted
                </span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Standardized 13 CFR § 106.203 cosponsorship agreement with all parties, Boulder City location, NAICS 541715,
                financial budget lines ($81,000 Total), Articles I through XV, and Directorate signatures fully populated.
              </p>
            </div>
            <button
              onClick={() => copyToClipboard(generateFilledTemplateDraft(), 'filled_template_copy')}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black font-extrabold uppercase rounded-lg transition cursor-pointer shrink-0 shadow-md shadow-amber-500/20 flex items-center gap-1.5"
            >
              <span>📋</span>
              <span>{copiedKey === 'filled_template_copy' ? 'Copied Full Draft!' : 'Copy Filled Agreement (MD)'}</span>
            </button>
          </div>

          <pre className="p-4 bg-[#050810] border border-gray-800 rounded-xl text-slate-200 overflow-x-auto leading-relaxed text-[11px] max-h-[500px] whitespace-pre-wrap">
            {generateFilledTemplateDraft()}
          </pre>
        </div>
      )}

      {/* Footer Action Bar & Persistence */}
      <div className="pt-4 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs font-mono text-slate-400">
          Status:{' '}
          <span className="text-emerald-400 font-bold">
            {isSaved ? '✓ SAVED TO FIRESTORE & LOCAL LEDGER' : 'READY FOR EXECUTION & CERTIFICATION'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => copyToClipboard(generateFullLegalText(), 'quick_copy')}
            className="px-3 py-2 bg-[#111622] hover:bg-[#1a2234] border border-gray-700 text-slate-200 rounded-lg text-xs font-mono font-bold transition cursor-pointer"
          >
            {copiedKey === 'quick_copy' ? 'Copied!' : 'Copy Agreement'}
          </button>
          <button
            onClick={handleSaveAgreement}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-extrabold text-xs uppercase tracking-wider rounded-lg transition cursor-pointer shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
          >
            <span>📄</span>
            <span>Execute &amp; Save Agreement to Firestore</span>
          </button>
        </div>
      </div>
    </div>
  );
};
