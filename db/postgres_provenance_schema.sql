-- ============================================================
-- SUPER PROJECT EXCALIBUR // 13 AEROSPACE DEFENSE COMPANY
-- PostgreSQL Cryptographic Provenance & Unified Metadata Schema
-- ============================================================

-- ============================================================
-- 1. ARTIFACTS (Every file, dataset, binary, mission object)
-- ============================================================
CREATE TABLE IF NOT EXISTS artifacts (
    artifact_id        TEXT PRIMARY KEY,
    filename           TEXT NOT NULL,
    sha256             TEXT NOT NULL,
    size_bytes         BIGINT,
    mime_type          TEXT,
    created_at         TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. VALIDATION RECORDS (Raw validation results)
-- ============================================================
CREATE TABLE IF NOT EXISTS validation_records (
    record_id          TEXT PRIMARY KEY,
    artifact_id        TEXT REFERENCES artifacts(artifact_id),
    status             TEXT NOT NULL,
    checks             JSONB,
    validated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. SIGNED METADATA (KMS-signed envelopes)
-- ============================================================
CREATE TABLE IF NOT EXISTS signed_metadata (
    signed_id          TEXT PRIMARY KEY,
    record_id          TEXT REFERENCES validation_records(record_id),
    payload            JSONB NOT NULL,
    signature          TEXT NOT NULL,
    algorithm          TEXT NOT NULL,
    key_id             TEXT NOT NULL,
    signed_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. SBOM RECORDS (CycloneDX/SPDX ingestion)
-- ============================================================
CREATE TABLE IF NOT EXISTS sbom_records (
    sbom_id            TEXT PRIMARY KEY,
    artifact_id        TEXT REFERENCES artifacts(artifact_id),
    sbom               JSONB NOT NULL,
    generated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. PROVENANCE (SLSA build attestations)
-- ============================================================
CREATE TABLE IF NOT EXISTS provenance (
    provenance_id      TEXT PRIMARY KEY,
    artifact_id        TEXT REFERENCES artifacts(artifact_id),
    slsa_level         TEXT,
    builder            TEXT,
    build_type         TEXT,
    build_details      JSONB,
    created_at         TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6. TRANSPARENCY LOG (Rekor anchoring)
-- ============================================================
CREATE TABLE IF NOT EXISTS transparency_log (
    log_id             TEXT PRIMARY KEY,
    record_id          TEXT REFERENCES validation_records(record_id),
    rekor_uuid         TEXT,
    inclusion_proof    JSONB,
    anchored_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 7. WORKFLOW GATING (Turmex integration)
-- ============================================================
CREATE TABLE IF NOT EXISTS workflow_gates (
    gate_id            TEXT PRIMARY KEY,
    artifact_id        TEXT REFERENCES artifacts(artifact_id),
    gate_name          TEXT,
    gate_status        TEXT,
    reason             TEXT,
    evaluated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for high-throughput queries and joins
CREATE INDEX IF NOT EXISTS idx_artifacts_sha256 ON artifacts(sha256);
CREATE INDEX IF NOT EXISTS idx_validation_artifact ON validation_records(artifact_id);
CREATE INDEX IF NOT EXISTS idx_signed_record ON signed_metadata(record_id);
CREATE INDEX IF NOT EXISTS idx_sbom_artifact ON sbom_records(artifact_id);
CREATE INDEX IF NOT EXISTS idx_provenance_artifact ON provenance(artifact_id);
CREATE INDEX IF NOT EXISTS idx_transparency_record ON transparency_log(record_id);
CREATE INDEX IF NOT EXISTS idx_workflow_artifact ON workflow_gates(artifact_id);

-- Baseline Seed Entries
INSERT INTO artifacts (artifact_id, filename, sha256, size_bytes, mime_type)
VALUES ('test-001', '13.geoint.core_migration_provenance.json', '712cab29f6dea353014e33dec6473575cfd9f6589b0b86982dbda2ea6506337b', 1649, 'application/json')
ON CONFLICT (artifact_id) DO NOTHING;

INSERT INTO validation_records (record_id, artifact_id, status, checks)
VALUES ('val-001', 'test-001', 'PASS', '{"json_parse":"OK","sha256_match":"MATCH"}')
ON CONFLICT (record_id) DO NOTHING;
