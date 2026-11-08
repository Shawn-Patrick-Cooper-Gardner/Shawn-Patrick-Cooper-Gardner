# 13 Aerospace Defence Company — Implementation Plan

## Operational Provenance & Directorate
* **Entity**: 13 Aerospace Defence Company (13ADC) / C.O.R.E. / Super Project EXCALIBUR
* **Owner & Directorate**: Shawn Patrick Cooper Gardner
* **Authority**: Self-Appointed Authority / US-1 Authority | ATO PEC SL USA 00711617 | NAICS 541715
* **Execution Base**: Boulder City Aerospace Proving Grounds (89005)

---

## 1. Title 13 CFR § 106.203 Cosponsorship Agreement Protocol
* **Statutory Compliance**: Full implementation of all 6 mandatory provisions under Title 13 CFR Part 106 Subpart B:
  - **Provision (a)**: Mandatory written certification agreeing to abide by all provisions of the Cosponsorship Agreement, Subpart B, and § 106.100 definitions.
  - **Provision (b)**: Narrative description of the Cosponsored Activity (Project Excalibur Extreme-Duty Desert Telemetry & Rotary GSE Demonstration).
  - **Provision (c)**: Detailed bilateral matrix defining rights, duties, and responsibilities for both SBA and 13 Aerospace Defence Company.
  - **Provision (d)**: Proposed itemized budget detailing financial contributions (Mercury cash, in-kind GSE vehicles, SBA resources) and direct anticipated expenses ($7OIL fuels, avionics sensors, nitrogen GSE).
  - **Provision (e)**: Certified non-profit statement confirming neither 13ADC nor Directorate will make a profit.
  - **Provision (f)**: Participant fees limitation and priority liquidation clause (fees cannot exceed direct costs and must liquidate first).
* **Component**: `/components/CosponsorshipAgreementPortal.tsx` with live editing, legal formatting, and 1-click clipboard export.

---

## 2. Mercury Business Checking Deposit Dispatcher & Kraken OTC Pre-Liquidation Lock
* **Source Specification**: `/public/assets/aistudio/deposit_instructions_1d4412d1.yaml`
* **Bank Provider**: Mercury Business Checking
* **Account Holder**: 13 Aerospace Defence Company (Shawn Patrick Cooper Gardner)
* **Automatic Split Allocations**:
  - **Leg 1**: `$500.00` USD -> Active Oil/Fuel Account: **`$7OIL`**
  - **Leg 2**: `$500.00` USD -> Corporate Treasury Account: **`$13adCompany`**
  - **Total Dispatched**: `$1,000.00` USD
* **Kraken OTC Pre-Liquidation Gate**:
  - Gate remains `LOCKED_PRE_DEPOSIT` until the $500 ($7OIL) and $500 ($13adCompany) Mercury transfers are executed and verified.
  - Upon dispatch, the gate transitions to `CLEARED_FOR_MAJOR_LIQUIDATION`, unblocking stock and equity portfolio liquidations at Kraken OTC.
* **Component**: `/components/MercuryKrakenGateway.tsx` with deep-links, ACH trace IDs, and real-time execution status.

---

## 3. Database Persistence & Security
* **Blueprint**: `/firebase-blueprint.json` defining `cosponsorshipAgreement` and `mercuryDispatch` intermediate representations.
* **Rules**: `/firestore.rules` enforcing attribute-based access control (ABAC) and validation helpers (`isValidCosponsorship`, `isValidMercuryDispatch`).
* **Service**: `/services/firebaseService.ts` providing Firestore initialization targeting database ID `ai-studio-superprojectexca-ba978816-9078-4d01-a370-3400dfef9959` with standardized error logging.
