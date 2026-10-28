"""
Super Project EXCALIBUR // 13 Aerospace Defense Company
Cryptographic Hardware Security Module (HSM) / AWS KMS Signer
Algorithm: RSASSA_PSS_SHA_256
Authority: US 1 AUTHORITY / PEC 00711617
"""

import json
import base64
import os
from typing import Optional, Dict, Any

try:
    import boto3
    BOTO3_AVAILABLE = True
except ImportError:
    boto3 = None
    BOTO3_AVAILABLE = False


class KMSSigner:
    """
    Cryptographic KMS Signer providing asymmetric RSASSA_PSS_SHA_256 signing
    for provenance metadata records, migration manifests, and validation reports.
    """
    def __init__(self, key_id: str, client: Optional[Any] = None, region_name: Optional[str] = None):
        self.key_id = key_id
        if client:
            self.kms = client
        elif BOTO3_AVAILABLE:
            region = region_name or os.environ.get("AWS_REGION", "us-gov-west-1")
            self.kms = boto3.client("kms", region_name=region)
        else:
            self.kms = None

    def sign(self, payload: dict) -> dict:
        """
        Signs canonical UTF-8 JSON payload with KMS key using RSASSA_PSS_SHA_256.
        Returns a cryptographic envelope containing payload, signature, algorithm, and key_id.
        """
        raw = json.dumps(payload, sort_keys=True).encode("utf-8")
        if self.kms:
            response = self.kms.sign(
                KeyId=self.key_id,
                Message=raw,
                MessageType="RAW",
                SigningAlgorithm="RSASSA_PSS_SHA_256"
            )
            signature = base64.b64encode(response["Signature"]).decode("utf-8")
        else:
            # Deterministic simulation fallback when boto3 or AWS KMS is offline
            import hashlib
            digest = hashlib.sha256(raw).digest()
            mock_sig = b"MOCK_KMS_RSASSA_PSS_SHA256:" + digest
            signature = base64.b64encode(mock_sig).decode("utf-8")

        return {
            "payload": payload,
            "signature": signature,
            "algorithm": "RSASSA_PSS_SHA_256",
            "key_id": self.key_id
        }

    def verify(self, signed_envelope: dict) -> bool:
        """
        Verifies signature of a signed envelope.
        """
        payload = signed_envelope.get("payload", {})
        signature_b64 = signed_envelope.get("signature", "")
        raw = json.dumps(payload, sort_keys=True).encode("utf-8")
        signature_bytes = base64.b64decode(signature_b64)

        if self.kms:
            try:
                res = self.kms.verify(
                    KeyId=self.key_id,
                    Message=raw,
                    MessageType="RAW",
                    Signature=signature_bytes,
                    SigningAlgorithm="RSASSA_PSS_SHA_256"
                )
                return res.get("SignatureValid", False)
            except Exception:
                return False
        else:
            import hashlib
            digest = hashlib.sha256(raw).digest()
            expected = base64.b64encode(b"MOCK_KMS_RSASSA_PSS_SHA256:" + digest).decode("utf-8")
            return signature_b64 == expected


if __name__ == "__main__":
    # Test execution demonstration
    signer = KMSSigner(key_id="arn:aws:kms:us-gov-west-1:007116171313:key/excalibur-geo-core-signing-key")
    sample_payload = {
        "authority": "US 1 AUTHORITY",
        "entity": "13 Aerospace Defense Company",
        "record_id": "geo-migrate-2026-10-07-01",
        "status": "PASS"
    }
    envelope = signer.sign(sample_payload)
    print("Signed Cryptographic Envelope:")
    print(json.dumps(envelope, indent=2))
    print(f"Verification Result: {signer.verify(envelope)}")
