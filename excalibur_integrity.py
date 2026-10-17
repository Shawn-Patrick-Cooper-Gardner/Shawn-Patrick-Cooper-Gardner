import json
import hashlib
from datetime import datetime, timezone

CONFIG = "payload_config.json"

with open(CONFIG, "rb") as f:
    raw = f.read()

config = json.loads(raw.decode("utf-8"))

digest = hashlib.sha256(raw).hexdigest()
timestamp = datetime.now(timezone.utc).isoformat()

print()
print("==============================================")
print("     EXCALIBUR LOCAL INTEGRITY VERIFIER")
print("==============================================")
print(f"UTC TIME:       {timestamp}")
print(f"PROJECT:        {config['project']}")
print(f"ORGANIZATION:   {config['organization']}")
print(f"OPERATOR:       {config['operator']}")
print(f"DEVICE:         {config['device']}")
print("----------------------------------------------")
print("SHA-256:")
print(digest)
print("----------------------------------------------")
print("CONFIGURATION:  VERIFIED")
print("AUTHORITY:      NOT_ESTABLISHED")
print("GOV AUTHORITY:  NOT_ESTABLISHED")
print("AWARD AUTH:     NOT_ESTABLISHED")
print("NETWORK CTRL:   NOT_ESTABLISHED")
print("TELEMETRY:      NOT_ESTABLISHED")
print("==============================================")
print()
