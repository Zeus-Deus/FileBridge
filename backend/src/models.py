from datetime import datetime
from .extensions import db   # changed to use extensions.py

class FileUpload(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    unique_filename = db.Column(db.String(256), unique=True, nullable=False)
    original_filename = db.Column(db.String(256), nullable=False)
    upload_time = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    download_time = db.Column(db.DateTime, nullable=True)
    download_confirmed = db.Column(db.Boolean, default=False, nullable=False)

    def to_dict(self):
        return {
            "unique_filename": self.unique_filename,
            "original_filename": self.original_filename,
            "upload_time": self.upload_time.isoformat(),
            "download_time": self.download_time.isoformat() if self.download_time else None,
            "download_confirmed": self.download_confirmed
        }
