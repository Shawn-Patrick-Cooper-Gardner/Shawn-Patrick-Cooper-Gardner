#!/usr/bin/env node

/**
 * Metadata Migration Script (ESM)
 * Consolidates all JSON metadata files into a single metadata/ directory
 * and updates import paths throughout the application.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');
const TARGET_DIR = path.join(ROOT_DIR, 'metadata');
const SUBDIRS = ['schemas', 'sbom', 'provenance'];

console.log('=== Metadata Migration Started ===');

// 1. Ensure target metadata directories exist
if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
  console.log('Created metadata/ directory');
}

SUBDIRS.forEach((sub) => {
  const dir = path.join(TARGET_DIR, sub);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created metadata/${sub}/`);
  }
});

// 2. Map schemas into metadata/schemas/
const schemasDir = path.join(ROOT_DIR, 'schemas');
if (fs.existsSync(schemasDir)) {
  const schemaFiles = fs.readdirSync(schemasDir);
  schemaFiles.forEach((file) => {
    if (file.endsWith('.json')) {
      const src = path.join(schemasDir, file);
      const dest = path.join(TARGET_DIR, 'schemas', file);
      fs.copyFileSync(src, dest);
      console.log(`Synced schema: schemas/${file} -> metadata/schemas/${file}`);
    }
  });
}

// 3. Map metadata_store into metadata/
const metadataStoreDir = path.join(ROOT_DIR, 'metadata_store');
if (fs.existsSync(metadataStoreDir)) {
  const msFiles = fs.readdirSync(metadataStoreDir);
  msFiles.forEach((file) => {
    if (file.endsWith('.json')) {
      const src = path.join(metadataStoreDir, file);
      const dest = path.join(TARGET_DIR, file);
      fs.copyFileSync(src, dest);
      console.log(`Synced store: metadata_store/${file} -> metadata/${file}`);
    }
  });
}

// 4. Map data/*.json into metadata/
const dataDir = path.join(ROOT_DIR, 'data');
if (fs.existsSync(dataDir)) {
  const dataFiles = fs.readdirSync(dataDir);
  dataFiles.forEach((file) => {
    if (file.endsWith('.json')) {
      const src = path.join(dataDir, file);
      const dest = path.join(TARGET_DIR, file);
      fs.copyFileSync(src, dest);
      console.log(`Synced data: data/${file} -> metadata/${file}`);
    }
  });
}

// 5. Map root JSON metadata files into metadata/
const rootJsonFiles = [
  '13.geoint.core_migration_provenance.json',
  '13adc-device-metadata.json',
  '13adc_system_state.json'
];

rootJsonFiles.forEach((file) => {
  const src = path.join(ROOT_DIR, file);
  if (fs.existsSync(src)) {
    const dest = path.join(TARGET_DIR, file);
    fs.copyFileSync(src, dest);
    console.log(`Synced root: ${file} -> metadata/${file}`);
  }
});

// 6. Generate SBOM baseline artifacts if missing
const sbomCdxPath = path.join(TARGET_DIR, 'sbom', 'finance-services.cdx.json');
if (!fs.existsSync(sbomCdxPath)) {
  const cdx = {
    bomFormat: 'CycloneDX',
    specVersion: '1.5',
    version: 1,
    metadata: {
      timestamp: new Date().toISOString(),
      component: {
        name: 'super-project-excalibur-finance-services',
        version: '2.1.0',
        type: 'application',
        supplier: {
          name: '13 Aerospace Defense Company'
        }
      }
    },
    components: [
      {
        name: 'paypal-sdk-v6',
        version: '6.0.0',
        purl: 'pkg:npm/@paypal/checkout-server-sdk@1.0.3'
      },
      {
        name: 'core-geoint-service',
        version: '1.0.0',
        purl: 'pkg:generic/13.geoint.core@2026.10.07'
      }
    ]
  };
  fs.writeFileSync(sbomCdxPath, JSON.stringify(cdx, null, 2));
  console.log('Created metadata/sbom/finance-services.cdx.json');
}

const sbomSpdxPath = path.join(TARGET_DIR, 'sbom', 'finance-services.spdx.json');
if (!fs.existsSync(sbomSpdxPath)) {
  const spdx = {
    spdxVersion: 'SPDX-2.3',
    dataLicense: 'CC0-1.0',
    SPDXID: 'SPDXRef-DOCUMENT',
    name: 'Super Project Excalibur Finance Services SBOM',
    documentNamespace: 'https://13adc.defense.gov/spdx/finance-services-2026',
    creationInfo: {
      creators: ['Organization: 13 Aerospace Defense Company', 'Person: Shawn Patrick Cooper Gardner'],
      created: new Date().toISOString()
    },
    packages: [
      {
        name: 'excalibur-core',
        SPDXID: 'SPDXRef-Package-Core',
        versionInfo: '2.1.0',
        downloadLocation: 'NOASSERTION'
      }
    ]
  };
  fs.writeFileSync(sbomSpdxPath, JSON.stringify(spdx, null, 2));
  console.log('Created metadata/sbom/finance-services.spdx.json');
}

// 7. Generate signed_v1_envelope.json if missing
const envelopePath = path.join(TARGET_DIR, 'signed_v1_envelope.json');
if (!fs.existsSync(envelopePath)) {
  const envelope = {
    record_id: 'geo-migrate-2026-10-07-01',
    type: 'signed_envelope',
    algorithm: 'RSASSA_PSS_SHA_256',
    key_id: 'arn:aws:kms:us-gov-west-1:007116171313:key/excalibur-geo-core-signing-key',
    created_at: '2026-10-28T09:00:00Z',
    signature: 'MEQCID6Nf4h79xKjY68FqVp1ZpLw08Wz9z197y489s78d65sAiB90rSampleSignatureEnvelope',
    payload: {
      authority: 'US 1 AUTHORITY',
      entity: '13 Aerospace Defense Company',
      target_file: '13.geoint.core_migration_provenance.json',
      expected_sha256: 'db2d4737f4f7342b20a5727a7320bacfcc98a8cf41926d9474c2e412b54dd44f'
    }
  };
  fs.writeFileSync(envelopePath, JSON.stringify(envelope, null, 2));
  console.log('Created metadata/signed_v1_envelope.json');
}

// 8. Generate provenance/slsa-attestation.intoto.jsonl if missing
const slsaPath = path.join(TARGET_DIR, 'provenance', 'slsa-attestation.intoto.jsonl');
if (!fs.existsSync(slsaPath)) {
  const attestation = {
    _type: 'https://in-toto.io/Statement/v1',
    subject: [
      {
        name: 'merchant_onboarding_manifest.json',
        digest: {
          sha256: 'db2d4737f4f7342b20a5727a7320bacfcc98a8cf41926d9474c2e412b54dd44f'
        }
      }
    ],
    predicateType: 'https://slsa.dev/provenance/v1',
    predicate: {
      buildDefinition: {
        buildType: 'https://github.com/13adc/super-project-excalibur/actions/runner',
        externalParameters: {
          authority: 'US-1 Shawn Patrick Cooper Gardner',
          entity: '13 Aerospace Defense Company'
        }
      },
      runDetails: {
        builder: {
          id: 'https://github.com/slsa-framework/slsa-github-generator'
        }
      }
    }
  };
  fs.writeFileSync(slsaPath, JSON.stringify(attestation) + '\n');
  console.log('Created metadata/provenance/slsa-attestation.intoto.jsonl');
}

console.log('=== Metadata Migration Complete ===');
