import os
from flask import Flask
from flask_cors import CORS
from .extensions import db  # changed: now import db from extensions.py
from .routes import blueprint

def create_app():
    app = Flask(__name__)
    # Database configuration; DATABASE_URL should be set to your production database URI.
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get("DB_URL", "sqlite:///filebridge.db")
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    # Set max upload size to 2GB (can be overridden by env variable)
    app.config['MAX_CONTENT_LENGTH'] = int(os.environ.get("MAX_CONTENT_LENGTH", 2147483648))
    
    db.init_app(app)
    CORS(app)
    app.register_blueprint(blueprint)
    
    with app.app_context():
        db.create_all()  # Create tables if they don't exist
    return app