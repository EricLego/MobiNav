from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_cors import CORS
import os
from dotenv import load_dotenv

load_dotenv()

db = SQLAlchemy()
login_manager = LoginManager()

def create_app():
    app = Flask(__name__)
    
    # --- Modify CORS Initialization ---
    # Instead of just CORS(app), configure it more explicitly:
    CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})
    # This tells Flask-CORS: "For any route starting with /api/,
    # allow requests that originate from http://localhost:3000"
    # ---------------------------------

    app.config.from_object("app.config.Config")

    db.init_app(app)
    login_manager.init_app(app)

    from app.routes import main
    app.register_blueprint(main)

    return app
