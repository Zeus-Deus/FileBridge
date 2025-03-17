import os
import io
import pytest
from flask import json
from cryptography.fernet import Fernet

# Set environment variables for testing
os.environ["ENCRYPTION_KEY"] = Fernet.generate_key().decode()
os.environ["API_TOKEN"] = "test-api-token"
os.environ["DB_URL"] = "sqlite:///:memory:"
os.environ["MAX_CONTENT_LENGTH"] = "2147483648"

from src import create_app

@pytest.fixture
def client():
    app = create_app()
    app.config['TESTING'] = True
    with app.test_client() as client:
        with app.app_context():
            from src.extensions import db
            db.create_all()
        yield client

def auth_headers(token="test-api-token"):
    return {"Authorization": f"Bearer {token}"}

def test_unauthorized_access(client):
    # Test health endpoint without API token
    response = client.get("/health")
    assert response.status_code == 401
    
    # Test upload endpoint with invalid token
    response = client.post("/upload", headers=auth_headers("wrong-token"))
    assert response.status_code == 401

def test_upload_without_file(client):
    # Test POST /upload without file data.
    response = client.post("/upload", headers=auth_headers())
    data = json.loads(response.data)
    assert response.status_code == 400
    assert "error" in data

def test_max_files_limit(client):
    # Upload 3 files successfully
    file_content = b"Content for max limit test"
    for i in range(3):
        data = {"file": (io.BytesIO(file_content), f"test{i}.txt")}
        response = client.post("/upload", data=data, headers=auth_headers(), content_type='multipart/form-data')
        assert response.status_code == 200

    # Fourth upload should fail due to limit reached
    data = {"file": (io.BytesIO(file_content), "test_over_limit.txt")}
    response = client.post("/upload", data=data, headers=auth_headers(), content_type='multipart/form-data')
    data = json.loads(response.data)
    assert response.status_code == 400
    assert "Maximum number of active files reached" in data.get("error", "")
