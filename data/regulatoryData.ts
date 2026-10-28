export interface RegulatoryClaim {
  id: string;
  citation: string;
  topic: string;
  claim: string;
  status: string;
  evidence_source?: string;
  source_note?: string;
  disposition?: string;
  prohibited_use?: string[];
  excalibur_trigger?: string[];
  evidence_required?: string[];
  human_review_required: boolean;
  current_excalibur_status?: string;
  excalibur_control?: string;
  excalibur_status?: string;
  legal_classification?: string;
  control?: string;
}

export interface RegulatoryControl {
  id: string;
  name: string;
  rule: string;
  status: string;
}

export interface RegulatoryRegisterData {
  metadata: {
    document_control: string;
    record_name: string;
    version: string;
    timestamp: string;
    sha256_fixity: string;
    status: string;
    legal_opinion: string;
    external_regulatory_determination: string;
  };
  register: {
    record: {
      name: string;
      version: string;
      project: string;
      entity: string;
      entity_type: string;
      jurisdiction: string;
      primary_regulatory_chapters: string[];
      hearing_reference: {
        date: string;
        board: string;
      };
      status: string;
      legal_opinion: string;
      external_regulatory_determination: string;
    };
    claims: RegulatoryClaim[];
    controls: RegulatoryControl[];
    evidence_policy: Record<string, boolean>;
    current_project_state: Record<string, string>;
  };
}

export const NV_REGULATORY_REGISTER: RegulatoryRegisterData = {
  metadata: {
    document_control: "EXCALIBUR-NV-REG-2026-01",
    record_name: "NV_REGULATORY_CLAIM_REGISTER",
    version: "1.0",
    timestamp: "2026-09-27T10:02:06.578Z",
    sha256_fixity: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    status: "INTERNAL_COMPLIANCE_CONTROL",
    legal_opinion: "NOT_ESTABLISHED",
    external_regulatory_determination: "NOT_ESTABLISHED"
  },
  register: {
    record: {
      name: "NV_REGULATORY_CLAIM_REGISTER",
      version: "1.0",
      project: "PROJECT EXCALIBUR",
      entity: "Shawn Patrick Cooper Gardner d/b/a 13 Aerospace Defense Company",
      entity_type: "SOLE_PROPRIETORSHIP",
      jurisdiction: "NEVADA",
      primary_regulatory_chapters: [
        "NRS Chapter 625",
        "NAC Chapter 625",
        "NAC Chapter 329"
      ],
      hearing_reference: {
        date: "2026-10-07",
        board: "Nevada State Board of Professional Engineers and Land Surveyors"
      },
      status: "INTERNAL_COMPLIANCE_CONTROL",
      legal_opinion: "NOT_ESTABLISHED",
      external_regulatory_determination: "NOT_ESTABLISHED"
    },
    claims: [
      {
        id: "NV-REG-001",
        citation: "NRS 625.013",
        topic: "Engineering/land-surveying firm definition",
        claim: "Nevada's statutory and regulatory framework contains a defined concept of a firm engaged in or offering professional engineering or land surveying services.",
        status: "REQUIRES_EVIDENCE",
        excalibur_trigger: [
          "Offering professional engineering services",
          "Offering professional land-surveying services"
        ],
        evidence_required: [
          "Current NRS 625.013 text",
          "Current NAC 625 firm-registration provisions"
        ],
        human_review_required: true
      },
      {
        id: "NV-REG-002",
        citation: "NRS 625.040",
        topic: "Practice of land surveying",
        claim: "Nevada law defines the practice of land surveying through specified surveying activities, including certain determinations concerning property boundaries, monuments, earth-surface configuration, fixed objects, geodetic/cadastral surveying, and topographic surveying.",
        status: "VERIFIED_WITH_SCOPE_REVIEW",
        evidence_source: "Nevada Legislative Counsel Bureau",
        source_note: "Current applicability to a particular EXCALIBUR sensing workflow must be determined from the exact activity, method, purpose, and deliverable.",
        excalibur_trigger: [
          "Boundary determination",
          "Property-line work",
          "Monument establishment or relocation",
          "Regulated survey deliverable",
          "Surveying activity represented as professional land surveying"
        ],
        evidence_required: [
          "Current NRS 625.040",
          "Current NAC 625 land-surveying standards"
        ],
        human_review_required: true
      },
      {
        id: "NV-REG-003",
        citation: "NRS 625.040(3)",
        topic: "Claimed sensing/research exclusion",
        claim: "Geological, aerial, technical, or research sensing is categorically excluded from the practice of land surveying under NRS 625.040(3).",
        status: "NOT_ESTABLISHED",
        disposition: "DO NOT USE THIS CLAIM AS A VERIFIED LEGAL EXCEPTION until the exact current statutory subsection and its application to EXCALIBUR's proposed sensing activities have been independently reviewed.",
        prohibited_use: [
          "Do not label EXCALIBUR terrain sensing automatically exempt.",
          "Do not cite this entry as a legal safe harbor."
        ],
        human_review_required: true
      },
      {
        id: "NV-REG-004",
        citation: "NRS 625.080",
        topic: "Responsible charge",
        claim: "Nevada law defines responsible charge in relation to independent control and direction or supervision of professional engineering or land-surveying work.",
        status: "REQUIRES_EVIDENCE",
        excalibur_trigger: [
          "Regulated professional work",
          "Professional engineering deliverable",
          "Professional land-surveying deliverable"
        ],
        human_review_required: true
      },
      {
        id: "NV-REG-005",
        citation: "NAC 625.425",
        topic: "Firm registration",
        claim: "Applicable Nevada firm-registration requirements must be evaluated when a business engages in or offers regulated professional engineering or land-surveying practice.",
        status: "REQUIRES_HUMAN_REVIEW",
        current_excalibur_status: "NOT_ESTABLISHED",
        evidence_required: [
          "Current NAC 625.425",
          "Current Board registration requirements"
        ],
        human_review_required: true
      },
      {
        id: "NV-REG-006",
        citation: "NAC 625.545",
        topic: "Written contracts",
        claim: "Written-contract requirements apply to regulated professional work within the scope of the applicable provision.",
        status: "REQUIRES_EVIDENCE",
        current_excalibur_status: "NO_REGULATED_SERVICE_ESTABLISHED",
        human_review_required: true
      },
      {
        id: "NV-REG-007",
        citation: "NAC 625.610",
        topic: "Professional stamps/seals/signatures",
        claim: "Nevada professional-document requirements can apply to documents prepared by licensed professional engineers or land surveyors.",
        status: "REQUIRES_EVIDENCE",
        excalibur_control: "EXCALIBUR research outputs shall not be represented as sealed or signed professional engineering or land-surveying documents without applicable professional authorization.",
        current_excalibur_status: "NOT_ESTABLISHED",
        human_review_required: true
      },
      {
        id: "NV-REG-008",
        citation: "NAC 625.611",
        topic: "Plans/maps/specifications/public authorities",
        claim: "Documents within the regulated professional-practice framework may have sealing, signing, and responsible-licensee requirements.",
        status: "REQUIRES_EVIDENCE",
        excalibur_trigger: [
          "Public-authority engineering submission",
          "Regulated plans/specifications",
          "Certified professional document"
        ],
        human_review_required: true
      },
      {
        id: "NV-REG-009",
        citation: "NAC 625.612",
        topic: "Reports/studies/test results/certifications/calculations",
        claim: "Certain reports, studies, test results, certifications, and calculations may fall within regulated professional-document requirements.",
        status: "REQUIRES_EVIDENCE",
        excalibur_control: "Computational research outputs remain research outputs unless and until their intended use and professional character trigger applicable Nevada requirements.",
        human_review_required: true
      },
      {
        id: "NV-REG-010",
        citation: "NAC 625.630",
        topic: "Offering/advertising regulated practice",
        claim: "Nevada regulates representations concerning offering professional engineering or land-surveying services.",
        status: "REQUIRES_EVIDENCE",
        excalibur_control: "EXCALIBUR commercial materials shall not represent the entity as offering Nevada-regulated professional engineering or land-surveying services unless applicable authorization is established.",
        current_excalibur_status: "NOT_ESTABLISHED",
        human_review_required: true
      },
      {
        id: "NV-REG-011",
        citation: "NAC 625.651-625.790",
        topic: "Land-surveying standards",
        claim: "Chapter 625 contains detailed standards applicable to professional land-surveying activities.",
        status: "REQUIRES_EVIDENCE",
        excalibur_trigger: [
          "Boundary surveying",
          "Survey monument work",
          "Construction surveying",
          "Legal descriptions",
          "Certified survey drawings",
          "Other regulated surveying functions"
        ],
        current_excalibur_status: "NOT_PROPOSED",
        human_review_required: true
      },
      {
        id: "NV-REG-012",
        citation: "NAC 625.790",
        topic: "Legal descriptions",
        claim: "Legal-description activities may implicate professional land-surveying requirements.",
        status: "REQUIRES_EVIDENCE",
        excalibur_status: "NOT_PROPOSED",
        human_review_required: true
      },
      {
        id: "NV-REG-013",
        citation: "NAC 329.010",
        topic: "Corner records",
        claim: "Nevada Chapter 329 contains requirements governing corner records.",
        status: "REQUIRES_EVIDENCE",
        excalibur_status: "NOT_PROPOSED",
        human_review_required: true
      },
      {
        id: "NV-REG-014",
        citation: "NAC 329.020",
        topic: "Reconstruction/rehabilitation of monuments",
        claim: "Nevada Chapter 329 contains requirements concerning reconstruction or rehabilitation of survey monuments in the circumstances specified by the regulation.",
        status: "REQUIRES_EVIDENCE",
        excalibur_status: "NOT_PROPOSED",
        human_review_required: true
      },
      {
        id: "NV-REG-015",
        citation: "NRS Chapter 625 / NAC Chapter 625",
        "topic": "Terrain sensing",
        claim: "LiDAR, GPR, hyperspectral imaging, magnetometry, and related sensor processing are proposed EXCALIBUR R&D activities.",
        status: "PROPOSED",
        legal_classification: "NOT_YET_DETERMINED",
        control: "Do not characterize the entire sensing workflow as categorically exempt from land-surveying regulation without activity-specific review.",
        human_review_required: true
      },
      {
        id: "NV-REG-016",
        citation: "NRS Chapter 625 / NAC Chapter 625",
        topic: "Hazmat transport modeling",
        claim: "CFD, vehicle-dynamics modeling, tanker-surge modeling, and related simulations are proposed EXCALIBUR research activities.",
        status: "PROPOSED",
        legal_classification: "NOT_YET_DETERMINED",
        control: "Research simulation outputs shall not be represented as certified professional engineering deliverables without applicable review and authorization.",
        human_review_required: true
      },
      {
        id: "NV-REG-017",
        citation: "NRS Chapter 625 / NAC Chapter 625",
        topic: "Cyber-physical/data-integrity architecture",
        claim: "Cryptographic provenance, telemetry integrity, canonicalization, tamper-evident records, and cybersecurity controls are proposed software/data research activities.",
        status: "PROPOSED",
        legal_classification: "ACTIVITY_SPECIFIC",
        control: "The software/data function does not by itself establish professional engineering authorization or exemption. Regulatory implications must be evaluated if incorporated into a regulated professional deliverable.",
        human_review_required: true
      },
      {
        id: "NV-REG-018",
        citation: "NAC Chapter 329",
        topic: "Corner perpetuation",
        claim: "EXCALIBUR does not presently propose preparation or filing of corner records or reconstruction/rehabilitation of official survey monuments.",
        status: "NOT_PROPOSED",
        control: "Field personnel shall not intentionally disturb, relocate, reconstruct, or rehabilitate survey monuments as part of EXCALIBUR research.",
        human_review_required: false
      },
      {
        id: "NV-REG-019",
        citation: "NRS/NAC Chapter 625",
        topic: "Professional licensure status",
        claim: "Nevada PE or PLS licensure for the project entity or responsible personnel has been established.",
        status: "NOT_ESTABLISHED",
        evidence_required: [
          "Official Nevada license verification"
        ],
        human_review_required: true
      },
      {
        id: "NV-REG-020",
        citation: "NAC 625",
        topic: "Engineering-firm registration",
        claim: "13 Aerospace Defense Company is registered with the Nevada Board as a professional engineering or land-surveying firm.",
        status: "NOT_ESTABLISHED",
        evidence_required: [
          "Official Board registration record"
        ],
        human_review_required: true
      }
    ],
    controls: [
      {
        id: "CTRL-NV-001",
        name: "No Unsupported Exemption",
        rule: "No EXCALIBUR document may state that a technical activity is exempt from Chapter 625 without an authoritative source supporting the exact activity and legal basis.",
        status: "ACTIVE"
      },
      {
        id: "CTRL-NV-002",
        name: "No Unsupported PE/PLS Authority",
        rule: "No EXCALIBUR document may imply Nevada PE or PLS licensure, responsible charge, firm registration, sealing authority, or professional-service authority unless independently verified.",
        status: "ACTIVE"
      },
      {
        id: "CTRL-NV-003",
        name: "Research Deliverable Boundary",
        rule: "Research data, simulations, models, software outputs, and prototypes shall not be represented as certified professional engineering or land surveying deliverables without applicable authorization.",
        status: "ACTIVE"
      },
      {
        id: "CTRL-NV-004",
        name: "Survey Boundary",
        rule: "Boundary determination, property-line work, monument establishment, legal descriptions, construction surveying, certified survey maps, and corner records require activity-specific regulatory review.",
        status: "ACTIVE"
      },
      {
        id: "CTRL-NV-005",
        name: "Corner Protection",
        rule: "EXCALIBUR field testing shall not intentionally disturb, relocate, reconstruct, or rehabilitate official survey monuments.",
        status: "ACTIVE"
      },
      {
        id: "CTRL-NV-006",
        name: "Proposal Language",
        rule: "Federal R&D proposals may describe proposed research, simulation, modeling, sensing, software, and prototype activities, but shall not represent unestablished Nevada professional authority.",
        status: "ACTIVE"
      },
      {
        id: "CTRL-NV-007",
        name: "Transition Gate",
        rule: "Any transition from R&D into a customer-facing regulated professional service requires a compliance hold followed by regulatory review, professional authorization, contract review, and document-control review before release.",
        status: "ACTIVE"
      }
    ],
    evidence_policy: {
      source_authenticity_is_not_claim_verification: true,
      url_existence_is_not_authority: true,
      legal_interpretation_requires_human_review: true,
      current_regulation_required: true,
      historical_regulation_not_sufficient_for_current_claim: true,
      no_inference_from_business_name: true,
      no_inference_from_technical_vocabulary: true,
      no_inference_from_federal_proposal_status: true
    },
    current_project_state: {
      project_r_and_d: "PROPOSED",
      regulated_pe_services: "NOT_ESTABLISHED",
      regulated_pls_services: "NOT_ESTABLISHED",
      pe_license: "NOT_ESTABLISHED",
      pls_license: "NOT_ESTABLISHED",
      engineering_firm_registration: "NOT_ESTABLISHED",
      land_surveying_firm_registration: "NOT_ESTABLISHED",
      responsible_charge: "NOT_ESTABLISHED",
      corner_record_activity: "NOT_PROPOSED",
      monument_reconstruction: "NOT_PROPOSED",
      legal_opinion: "NOT_ESTABLISHED",
      external_regulatory_determination: "NOT_ESTABLISHED",
      federal_submission_authorization: "AUTHORIZED"
    }
  }
};
