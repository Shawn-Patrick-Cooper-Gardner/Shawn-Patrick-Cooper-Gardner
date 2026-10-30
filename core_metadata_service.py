from fastapi import FastAPI, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import base64
import uuid
import os
import argparse
from pathlib import Path
from validator import run_validation
from signer import KMSSigner

app = FastAPI(
    title="CORE Metadata Service",
    description="Super Project EXCALIBUR - CORE Metadata Storage & Cryptographic Artifact Validation Service",
    version="1.0.0"
)

# Initialize AWS KMS Signer
signer = KMSSigner(key_id=os.environ.get("KMS_KEY_ID", "arn:aws:kms:us-west-2:123456789012:key/your-key-id"))

# Enable CORS for browser frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = Path("./metadata")
DATA_DIR.mkdir(exist_ok=True)

class MetadataRecord(BaseModel):
    record_id: str
    type: str
    payload: dict

@app.get("/")
async def root():
    return {
        "service": "CORE Metadata Service",
        "authority": "13 Aerospace Defense Company / US-1-AUTHORITY",
        "project": "Super Project EXCALIBUR",
        "status": "ONLINE",
        "endpoints": [
            "POST /validate - Validates JSON artifact and outputs validation_v1.json report",
            "POST /metadata - Stores metadata record in metadata directory",
            "GET /metadata/{record_id} - Retrieves all stored metadata files for record_id",
            "GET /metadata - Lists all stored metadata records"
        ]
    }

@app.post("/validate")
async def validate_artifact(file: UploadFile):
    temp_path = DATA_DIR / f"upload_{uuid.uuid4()}.json"
    temp_path.write_bytes(await file.read())

    report, exit_code = run_validation(argparse.Namespace(
        file=str(temp_path),
        expected_sha256=None,
        output=None
    ))

    record_id = report["record_id"]
    record_path = DATA_DIR / f"{record_id}_validation.json"
    record_path.write_text(json.dumps(report, indent=2))

    return report

@app.post("/metadata")
async def store_metadata(record: MetadataRecord):
    path = DATA_DIR / f"{record.record_id}_{record.type}.json"
    path.write_text(json.dumps(record.payload, indent=2))
    return {"status": "stored", "record_id": record.record_id, "file": path.name}

@app.post("/metadata/signed")
async def store_signed_metadata(record: MetadataRecord):
    signed = signer.sign(record.payload)
    path = DATA_DIR / f"{record.record_id}_{record.type}_signed.json"
    with open(path, "w") as f:
        f.write(json.dumps(signed, indent=2))
    return {"status": "signed", "record_id": record.record_id}

@app.post("/verify")
async def verify_signature(signed_record: dict):
    raw = json.dumps(signed_record["payload"], sort_keys=True).encode("utf-8")
    signature = base64.b64decode(signed_record["signature"])

    if signer.kms:
        response = signer.kms.verify(
            KeyId=signed_record["key_id"],
            Message=raw,
            Signature=signature,
            MessageType="RAW",
            SigningAlgorithm=signed_record["algorithm"]
        )
        return {"valid": response["SignatureValid"]}
    else:
        # Verified fallback when KMS is in test/simulation mode
        valid = signer.verify(signed_record)
        return {"valid": valid}

class SignRequest(BaseModel):
    payload: dict
    key_id: str = "arn:aws:kms:us-gov-west-1:007116171313:key/excalibur-geo-core-signing-key"

@app.post("/sign")
async def sign_metadata(req: SignRequest):
    try:
        from kms_signer import KMSSigner
        signer = KMSSigner(key_id=req.key_id)
        envelope = signer.sign(req.payload)
        
        # If record_id is present in payload, persist signed envelope
        rec_id = req.payload.get("record_id")
        if rec_id:
            signed_path = DATA_DIR / f"{rec_id}_signed.json"
            signed_path.write_text(json.dumps(envelope, indent=2))
            
        return envelope
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"KMS Signing failed: {str(e)}")

@app.get("/metadata/{record_id}")
async def get_metadata(record_id: str):
    files = list(DATA_DIR.glob(f"{record_id}_*.json"))
    if not files:
        raise HTTPException(status_code=404, detail=f"No metadata found for record_id: {record_id}")
    return {f.name: json.loads(f.read_text()) for f in files}

@app.get("/metadata")
async def list_all_metadata():
    files = list(DATA_DIR.glob("*.json"))
    records = {}
    for f in sorted(files, key=lambda x: x.stat().st_mtime, reverse=True):
        try:
            records[f.name] = json.loads(f.read_text())
        except Exception:
            records[f.name] = {"error": "unparseable"}
    return {"total_files": len(files), "records": records}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
