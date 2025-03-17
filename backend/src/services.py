import os
import uuid
from datetime import datetime
from werkzeug.utils import secure_filename
from .models import FileUpload
from .extensions import db

UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'uploads')
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def count_active_files():
    return FileUpload.query.filter_by(download_confirmed=False).count()

def handle_file_upload(file, salt, iv):
    try:
        if count_active_files() >= 3:
            return {"error": "Maximum number of active files reached. Please delete a file to upload a new one."}
        original_filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4()}_{original_filename}"
        file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
        data = file.read()  # The file is already encrypted by the client.
        if not data:
            return {"error": "Empty file uploaded"}
        with open(file_path, "wb") as f:
            f.write(data)
        # Create a new DB record with salt and iv saved.
        new_file = FileUpload(unique_filename=unique_filename,
                              original_filename=original_filename,
                              salt=salt,
                              iv=iv)
        db.session.add(new_file)
        db.session.commit()
        return {"message": "File uploaded successfully", "filename": unique_filename}
    except Exception as e:
        print(f"Error in handle_file_upload: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"error": f"Upload failed: {str(e)}"}

def handle_file_download(filename):
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    file_record = FileUpload.query.filter_by(unique_filename=filename).first()
    if not file_record or not os.path.exists(file_path):
        return None
    with open(file_path, "rb") as f:
        file_data = f.read()
    if not file_record.download_time:
        file_record.download_time = datetime.utcnow()
        db.session.commit()
    # Note: Do NOT decrypt the file here; it remains encrypted.
    return file_data

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
