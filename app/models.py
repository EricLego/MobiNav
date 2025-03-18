from app import db
from flask_login import UserMixin
from datetime import datetime

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(256), nullable=False)

class Obstacle(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    obstacle_type = db.Column(db.String(50), nullable=False)  # stairs, construction, steep, etc.
    description = db.Column(db.Text, nullable=True)
    reported_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    reported_at = db.Column(db.DateTime, default=datetime.utcnow)
    active = db.Column(db.Boolean, default=True)  # Whether obstacle is still present
    
    def to_dict(self):
        return {
            'id': self.id,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'obstacle_type': self.obstacle_type,
            'description': self.description,
            'reported_at': self.reported_at.isoformat(),
            'active': self.active
        }

class AccessibilityFeature(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    feature_type = db.Column(db.String(50), nullable=False)  # elevator, ramp, etc.
    description = db.Column(db.Text, nullable=True)
    building_id = db.Column(db.String(50), nullable=True)  # Optional reference to a building
    
    def to_dict(self):
        return {
            'id': self.id,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'feature_type': self.feature_type,
            'description': self.description,
            'building_id': self.building_id
        }
