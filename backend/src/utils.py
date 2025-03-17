import os
from cryptography.fernet import Fernet

# Ensure ENCRYPTION_KEY is provided in the environment for production security.
encryption_key = os.environ.get("ENCRYPTION_KEY")
if not encryption_key:
    raise EnvironmentError("ENCRYPTION_KEY must be set in the environment for production deployments.")

cipher = Fernet(encryption_key)

def encrypt_data(data: bytes) -> bytes:
    # Encrypt data using Fernet symmetric encryption
    return cipher.encrypt(data)

def decrypt_data(data: bytes) -> bytes:
    # Decrypt data using Fernet symmetric encryption
    try:
        return cipher.decrypt(data)
    except Exception:
        return b""
