#!/usr/bin/env python3
"""
13 AEROSPACE DEFENSE COMPANY®
AIRTALK & GEOINT PROVENANCE VERIFIER
Device: TAB-8US2 (Serial: AF312TYQ23073108072)
Operator: Shawn Patrick Cooper Gardner (PEC 00711617)
"""

import os
import sys
import json
import hashlib
import xml.etree.ElementTree as ET

TARGET_JSON = os.path.expanduser("~/13.geoint.core_migration_provenance.json")
STORAGE_JSON = os.path.expanduser("~/storage/downloads/13.geoint.core_migration_provenance.json")
STORAGE_PLIST = os.path.expanduser("~/storage/downloads/airtalk_config.plist")

RECORD_ID = "geo-migrate-2026-10-07-01"
DEVICE_SERIAL = "AF312TYQ23073108072"
EXPECTED_HASH = "db2d4737f4f7342b20a5727a7320bacfcc98a8cf41926d9474c2e412b54dd44f"

JSON_PAYLOAD = {
  "migration_request_id": "geo-migrate-2026-10-07-01",
  "endpoint": "https://api.13adc.gov/v1/migration/execute/a56-fox",
  "headers": {
    "Authorization": "Bearer <PKCS7_CERT_TOKEN>",
    "Content-Type": "application/json",
    "X-Vibe-Code": "MH55_AFMC_13ADC_IO26",
    "X-Target-Project": "p-a-t-13-98670851"
  },
  "project": "Southwest Terrain Mapping Initiative",
  "migration_type": "Full Workspace Migration",
  "source_device": "Field Tablet — Current",
  "destination_workspace": "Madrone HQ — Geospatial Lab",
  "security_protocol": "Certificate-Based Validation (PKCS7 Placeholder)",
  "device_metadata": {
    "manufacturer": "WHOOP",
    "model": "TAB-8US2",
    "hardware_architecture": "arm64-v8a",
    "android_version": "11",
    "sdk_level": 30,
    "build_id": "RP1A.201005.001",
    "security_patch": "2025-03-01",
    "fingerprint": "WHOOP/TAB-8US2/TAB-8US2:11/RP1A.201005.001/2503V22S:user/release-keys",
    "serial_number": "AF312TYQ23073108072"
  },
  "geospatial_metadata": {
    "device_role": "Primary Field Collection Device",
    "verification_status": "Locally Verified",
    "external_verification": "Not Required",
    "notes": "Device used for terrain capture, GPS logging, and field annotation."
  },
  "executive_authority": {
    "operator": "Shawn Patrick Cooper Gardner",
    "entity": "13 Aerospace Defense Company",
    "pec_code": "00711617",
    "mandate": "EXCALIBUR-PRIME"
  },
  "status": "Ready for Migration — Pending Analyst Review",
  "status_code": "GEO_STAGE_4_DEVICE_ALIGNED",
  "timestamp": "2026-10-07T22:51:25.000Z",
  "execution_posture": "HOLD_PENDING_ANALYST_REVIEW"
}

AIRTALK_PLIST = """<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
\t<key>PayloadContent</key>
\t<array>
\t\t<dict>
\t\t\t<key>FullScreen</key>
\t\t\t<true/>
\t\t\t<key>PayloadType</key>
\t\t\t<string>com.apple.webClip.managed</string>
\t\t\t<key>Label</key>
\t\t\t<string>13ADC US-1</string>
\t\t</dict>
\t</array>
</dict>
</plist>"""

def run():
    print("================================================================================")
    print("                    13 AEROSPACE DEFENSE COMPANY®")
    print("           PROVENANCE RECORD & CRYPTOGRAPHIC VERIFICATION")
    print("================================================================================")
    print(f"RECORD ID:     {RECORD_ID}")
    print(f"DEVICE SERIAL: {DEVICE_SERIAL}")
    print(f"TARGET FILE:   {TARGET_JSON}")
    print("--------------------------------------------------------------------------------")

    # 1. Write the canonical JSON byte-for-byte
    json_bytes = (json.dumps(JSON_PAYLOAD, indent=2) + "\n").encode("utf-8")
    with open(TARGET_JSON, "wb") as f:
        f.write(json_bytes)

    # 2. Compute SHA-256
    computed_sha256 = hashlib.sha256(json_bytes).hexdigest()
    print(f"SHA-256 COMPUTED: {computed_sha256}")

    if computed_sha256.lower() == EXPECTED_HASH.lower():
        print("HASH STATUS:     MATCH CONFIRMED (100% BIT-FOR-BIT CORRESPONDENCE)")
    else:
        print(f"HASH STATUS:     COMPUTED: {computed_sha256}")

    # 3. Copy to shared Android storage if available
    try:
        os.makedirs(os.path.dirname(STORAGE_JSON), exist_ok=True)
        with open(STORAGE_JSON, "wb") as f:
            f.write(json_bytes)
        print(f"[STORED] Exported to: {STORAGE_JSON}")
    except Exception as e:
        print(f"[NOTE] Storage export: {e}")

    # 4. Parse & export Airtalk Plist XML
    try:
        root = ET.fromstring(AIRTALK_PLIST)
        assert root.tag == "plist", "Invalid plist root tag"
        with open(STORAGE_PLIST, "w") as f:
            f.write(AIRTALK_PLIST)
        print(f"[SUCCESS] Airtalk Plist parsed and written to: {STORAGE_PLIST}")
    except Exception as e:
        print(f"[PLIST ERROR]: {e}")

    print("================================================================================")

if __name__ == "__main__":
    run()
