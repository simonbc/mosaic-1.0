import json
import hashlib
import base64
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import hashes
from cryptography.exceptions import InvalidSignature


def hash_payload(payload) -> bytes:
    if isinstance(payload, dict):
        payload = json.dumps(payload, sort_keys=True, separators=(',', ':'))
    if isinstance(payload, str):
        payload = payload.encode('utf-8')
    elif not isinstance(payload, bytes):
        raise TypeError(f"Unsupported payload type: {type(payload)}")
    return hashlib.sha256(payload).digest()


def verify_signature(message: bytes, signature: str, public_key_hex: str) -> bool:
    try:
        signature_bytes = base64.b64decode(signature)
        public_key_bytes = bytes.fromhex(public_key_hex)

        public_key = ec.EllipticCurvePublicKey.from_encoded_point(ec.SECP256R1(), public_key_bytes)
        public_key.verify(signature_bytes, message, ec.ECDSA(hashes.SHA256()))
        return True
    except InvalidSignature:
        return False
    except Exception:
        return False