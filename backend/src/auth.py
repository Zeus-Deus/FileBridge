import os
from functools import wraps
from flask import request, jsonify

API_TOKEN = os.environ.get("API_TOKEN")
if not API_TOKEN:
    raise EnvironmentError("API_TOKEN must be set in the environment for production deployments.")

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.headers.get('Authorization', None)
        if not auth or auth.split(" ")[-1] != API_TOKEN:
            return jsonify({"error": "Unauthorized"}), 401
        return f(*args, **kwargs)
    return decorated
