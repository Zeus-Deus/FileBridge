import os
import io
import pytest
from flask import json
from cryptography.fernet import Fernet

# Set environment variables for testing before importing the app.
os.environ["ENCRYPTION_KEY"] = Fernet.generate_key().decode()
os.environ["API_TOKEN"] = "test-api-token"
os.environ["DB_URL"] = "sqlite:///:memory:"  # Use in-memory database for tests
os.environ["MAX_CONTENT_LENGTH"] = "2147483648"

from src import create_app  # ...existing code...

@pytest.fixture
def client():
    app = create_app()
    app.config['TESTING'] = True
    with app.test_client() as client:
        with app.app_context():
            from src.extensions import db
            db.create_all()
        yield client

def auth_headers():
    return {"Authorization": "Bearer test-api-token"}

def test_health_endpoint(client):
    response = client.get("/health", headers=auth_headers())
    data = json.loads(response.data)
    assert response.status_code == 200
    assert data.get("status") == "healthy"

def test_file_upload_list_download_confirm(client):
    # Upload file
    file_content = b"Test file content"
    data = {
        "file": (io.BytesIO(file_content), "test.txt")
    }
    response = client.post("/upload", data=data, headers=auth_headers(), content_type='multipart/form-data')
    upload_data = json.loads(response.data)
    assert response.status_code == 200
    assert "filename" in upload_data
    unique_filename = upload_data["filename"]

    # List files
    response = client.get("/files", headers=auth_headers())
    list_data = json.loads(response.data)
    assert response.status_code == 200
    files = list_data.get("files", [])
    assert any(f["unique_filename"] == unique_filename for f in files)

    # Download file
    response = client.get(f"/download/{unique_filename}", headers=auth_headers())
    assert response.status_code == 200
    downloaded_content = response.data
    assert downloaded_content == file_content

    # Confirm deletion of file
    response = client.post(
        f"/confirm/{unique_filename}",
        headers={**auth_headers(), "Content-Type": "application/json"},
        json={"confirmed": True}
    )
    confirm_data = json.loads(response.data)
    assert response.status_code == 200

    # Verify file is no longer listed
    response = client.get("/files", headers=auth_headers())
    list_after = json.loads(response.data)
    files_after = list_after.get("files", [])
    assert not any(f["unique_filename"] == unique_filename for f in files_after)
