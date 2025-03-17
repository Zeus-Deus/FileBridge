from flask import Flask, jsonify
from flask_cors import CORS
import os
from . import create_app

app = create_app()

# Get database URL from environment variable
db_url = os.environ.get('DB_URL', 'postgresql://postgres:postgres@db:5432/postgres')

@app.route('/')
def hello():
    return jsonify({
        "message": "Welcome to FileBridge API",
        "status": "online"
    })

@app.route('/health')
def health():
    return jsonify({
        "status": "healthy",
        "dbConnection": db_url is not None
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)