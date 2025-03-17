import os
import uuid
from datetime import datetime
from werkzeug.utils import secure_filename
from .utils import encrypt_data, decrypt_data
from .models import FileUpload
from .extensions import db   # changed to import db from extensions.py

# Define upload folder relative to project root
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'uploads')
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def count_active_files():
    return FileUpload.query.filter_by(download_confirmed=False).count()

def handle_file_upload(file):
    # Block upload if there are 3 active files
    if count_active_files() >= 3:
        return {"error": "Maximum number of active files reached. Please delete a file to upload a new one."}
    original_filename = secure_filename(file.filename)
    unique_filename = f"{uuid.uuid4()}_{original_filename}"
    file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
    data = file.read()
    encrypted = encrypt_data(data)
    with open(file_path, "wb") as f:
        f.write(encrypted)
    # Create a new DB record for metadata
    new_file = FileUpload(unique_filename=unique_filename, original_filename=original_filename)
    db.session.add(new_file)
    db.session.commit()
    return {"message": "File uploaded successfully", "filename": unique_filename}

def handle_file_download(filename):
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    file_record = FileUpload.query.filter_by(unique_filename=filename).first()
    if not file_record or not os.path.exists(file_path):
        return None
    with open(file_path, "rb") as f:
        encrypted_data = f.read()
    # Update download_time if not set
    if not file_record.download_time:
        file_record.download_time = datetime.utcnow()
        db.session.commit()
    decrypted = decrypt_data(encrypted_data)
    return decrypted

def handle_file_confirmation(filename, confirmed):
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    file_record = FileUpload.query.filter_by(unique_filename=filename).first()
    if not file_record or not os.path.exists(file_path):
        return {"error": "File not found."}
    if confirmed:
        # Delete file and remove DB record
        try:
            os.remove(file_path)
        except Exception:
            pass
        db.session.delete(file_record)
        db.session.commit()
        return {"message": "File deleted successfully."}
    else:
        # Mark as not confirmed; file will be auto-deleted later if older than 2 hours.
        file_record.download_confirmed = False
        db.session.commit()
        return {"message": "File retention for 2 hours confirmed."}

def list_uploaded_files():
    files = FileUpload.query.all()
    return [f.to_dict() for f in files]
