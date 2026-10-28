#!/usr/bin/env python3
"""
CORE Artifact Validation Engine // Super Project EXCALIBUR
Authority: 13 Aerospace Defense Company / US-1-AUTHORITY
Schema: https://metadata.core/validation_v1.json
"""

import os
import sys
import json
import hashlib
import platform
import argparse
import uuid
from datetime import datetime, timezone
from pathlib import Path


def compute_sha256(filepath: str | Path) -> str:
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest()


def run_validation(args) -> tuple[dict, int]:
    """
    Validates a target JSON artifact against cryptographic and structural standards.
    Conforms to https://metadata.core/validation_v1.json schema.
    Returns: (report_dict, exit_code)
    """
    check_time_utc = datetime.now(timezone.utc).isoformat()
    record_id = f"core-val-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:8]}"

    target_path = Path(args.file) if args and getattr(args, "file", None) else None
    expected_sha256 = getattr(args, "expected_sha256", None)

    checks = {
        "file_exists": False,
        "json_parse": "NOT_RUN",
        "expected_digest_format": "SKIPPED",
        "sha256_match": "SKIPPED",
    }

    report = {
        "$schema": "https://metadata.core/validation_v1.json",
        "record_id": record_id,
        "project": "Super Project EXCALIBUR",
        "check_time_utc": check_time_utc,
        "platform": platform.platform(),
        "python": platform.python_version(),
        "artifact": str(target_path) if target_path else "UNKNOWN",
        "artifact_sha256": "",
        "artifact_bytes": 0,
        "json_top_level_type": "unknown",
        "checks": checks,
        "status": "FAIL",
    }

    if not target_path or not target_path.exists():
        checks["file_exists"] = False
        checks["json_parse"] = "FAIL: File not found"
        report["status"] = "FAIL"
        return report, 1

    checks["file_exists"] = True
    raw_bytes = target_path.read_bytes()
    report["artifact_bytes"] = len(raw_bytes)
    computed_digest = hashlib.sha256(raw_bytes).hexdigest()
    report["artifact_sha256"] = computed_digest

    # Expected digest format check
    if expected_sha256:
        expected_clean = expected_sha256.strip().lower()
        if len(expected_clean) == 64 and all(c in "0123456789abcdef" for c in expected_clean):
            checks["expected_digest_format"] = "PASS"
            if computed_digest.lower() == expected_clean:
                checks["sha256_match"] = "PASS"
            else:
                checks["sha256_match"] = f"FAIL (mismatch: expected {expected_clean}, computed {computed_digest})"
        else:
            checks["expected_digest_format"] = "FAIL (Invalid sha256 hex string)"
            checks["sha256_match"] = "FAIL"
    else:
        checks["expected_digest_format"] = "SKIPPED"
        checks["sha256_match"] = "NO_BASELINE"

    # JSON parse check
    try:
        parsed = json.loads(raw_bytes.decode("utf-8"))
        checks["json_parse"] = "PASS"
        if isinstance(parsed, dict):
            report["json_top_level_type"] = "object"
        elif isinstance(parsed, list):
            report["json_top_level_type"] = "array"
        else:
            report["json_top_level_type"] = type(parsed).__name__
    except UnicodeDecodeError as e:
        checks["json_parse"] = f"FAIL: UTF-8 decoding error ({e})"
    except json.JSONDecodeError as e:
        checks["json_parse"] = f"FAIL: Malformed JSON ({e})"

    # Overall Status determination
    has_critical_failure = (
        checks["file_exists"] is False
        or checks["json_parse"] != "PASS"
        or (expected_sha256 and checks["sha256_match"] != "PASS")
    )

    if has_critical_failure:
        report["status"] = "FAIL"
        exit_code = 1
    else:
        report["status"] = "PASS"
        exit_code = 0

    output_file = getattr(args, "output", None)
    if output_file:
        out_p = Path(output_file)
        out_p.parent.mkdir(parents=True, exist_ok=True)
        out_p.write_text(json.dumps(report, indent=2))

    return report, exit_code


def main():
    parser = argparse.ArgumentParser(description="CORE Artifact Validation Engine")
    parser.add_argument("--file", "-f", required=True, help="Target JSON artifact file path")
    parser.add_argument("--expected-sha256", "-s", help="Optional expected 64-char SHA256 hex digest")
    parser.add_argument("--output", "-o", help="Optional file path to write validation report JSON")
    args = parser.parse_args()

    report, exit_code = run_validation(args)
    print(json.dumps(report, indent=2))
    sys.exit(exit_code)


if __name__ == "__main__":
    main()
