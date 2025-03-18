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
    CORS(app)
    
    app.config.from_object("app.config.Config")

    db.init_app(app)
    login_manager.init_app(app)

    from app.routes import main
    app.register_blueprint(main)
    
    # Initialize the database
    with app.app_context():
        db.create_all()
        # After database is created, add sample data
        initialize_sample_data()
    
    return app

def initialize_sample_data():
    """Initialize sample data for accessibility features and obstacles."""
    from app.models import AccessibilityFeature, Obstacle
    
    # Only add sample data if tables are empty
    if AccessibilityFeature.query.count() == 0:
        # Kennesaw State University coordinates (approximate)
        campus_features = [
            # KSU Student Center
            AccessibilityFeature(
                latitude=34.03931,
                longitude=-84.58102,
                feature_type="elevator",
                description="Student Center main elevator",
                building_id="student_center"
            ),
            # Kennesaw Library
            AccessibilityFeature(
                latitude=34.04149,
                longitude=-84.58446,
                feature_type="ramp",
                description="Library entrance wheelchair ramp",
                building_id="library"
            ),
            # Education Building
            AccessibilityFeature(
                latitude=34.03853,
                longitude=-84.58312,
                feature_type="automatic_door",
                description="Automatic entrance doors",
                building_id="education"
            ),
            # Social Sciences Building
            AccessibilityFeature(
                latitude=34.03804,
                longitude=-84.58150,
                feature_type="elevator",
                description="Social Sciences Building central elevator",
                building_id="social_sciences"
            ),
            # Clendenin Building
            AccessibilityFeature(
                latitude=34.03717,
                longitude=-84.58104,
                feature_type="ramp",
                description="Side entrance wheelchair ramp",
                building_id="clendenin"
            ),
        ]
        
        db.session.add_all(campus_features)
        db.session.commit()
    
    if Obstacle.query.count() == 0:
        # Sample obstacles around campus
        sample_obstacles = [
            # Construction area near Math building
            Obstacle(
                latitude=34.03964,
                longitude=-84.58264,
                obstacle_type="construction",
                description="Construction area blocking part of the path",
                active=True
            ),
            # Stairs near the Student Center
            Obstacle(
                latitude=34.03898,
                longitude=-84.58061,
                obstacle_type="stairs",
                description="Steep stairs, no nearby ramp",
                active=True
            ),
            # Temporary obstacle near Science Building
            Obstacle(
                latitude=34.04092,
                longitude=-84.58270,
                obstacle_type="temporary",
                description="Temporary event setup blocking main path",
                active=True
            ),
            # Steep hill near parking lot
            Obstacle(
                latitude=34.03779,
                longitude=-84.58368,
                obstacle_type="steep",
                description="Steep incline difficult for wheelchairs",
                active=True
            ),
        ]
        
        db.session.add_all(sample_obstacles)
        db.session.commit()
