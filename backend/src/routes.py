from flask import Blueprint, jsonify, request, send_file
import os
import io
from .services import handle_file_upload, handle_file_download, handle_file_confirmation, list_uploaded_files
from .auth import token_required

blueprint = Blueprint("main", __name__)

db_url = os.environ.get("DB_URL", "postgresql://postgres:postgres@db:5432/postgres")

@blueprint.route("/")
def hello():
    return jsonify({
        "message": "Welcome to FileBridge API",
        "status": "online"
    })

@blueprint.route("/health")
@token_required
def health():
    return jsonify({
        "status": "healthy",
        "dbConnection": db_url is not None
    })

@blueprint.route("/upload", methods=["POST"])
@token_required
def upload_file():
    file = request.files.get("file")
    if not file:
        return jsonify({"error": "No file provided"}), 400
    result = handle_file_upload(file)
    if "error" in result:
        return jsonify(result), 400
    return jsonify(result)

@blueprint.route("/download/<filename>", methods=["GET"])
@token_required
def download_file(filename):
    data = handle_file_download(filename)
    if data is None:
        return jsonify({"error": "File not found"}), 404
    original_name = filename.split("_", 1)[-1] if "_" in filename else filename
    return send_file(io.BytesIO(data), as_attachment=True, download_name=original_name)

@blueprint.route("/confirm/<filename>", methods=["POST"])
@token_required
def confirm_file(filename):
    req = request.get_json() or {}
    confirmed = req.get("confirmed", False)
    result = handle_file_confirmation(filename, confirmed)
    if "error" in result:
        return jsonify(result), 400
    return jsonify(result)

@blueprint.route("/files", methods=["GET"])
@token_required
def list_files():
    files = list_uploaded_files()
    return jsonify({"files": files})