from app import db
from datetime import datetime
from flask_login import UserMixin
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.sql import func # For server-side timestamp default
from datetime import datetime # Import datetime


class User(db.Model, UserMixin):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50))
    password_hash = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime)
    email = db.Column(db.String(150), unique=True, nullable=False)

class Building(db.Model):
    __tablename__ = 'building'
    building_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    address = db.Column(db.String(10))
    street = db.Column(db.String(50))
    city = db.Column(db.String(50))
    state = db.Column(db.String(2))
    zip_code = db.Column(db.String(10))
    latitude = db.Column(db.Numeric(9, 6))
    longitude = db.Column(db.Numeric(9, 6))
    updated_at = db.Column(db.DateTime)
    
    # Relationships
    entrances = db.relationship('Entrance', backref='building', cascade='all, delete-orphan')
    start_paths = db.relationship('Path', foreign_keys='Path.start_location_id', backref='start_location', cascade='all, delete-orphan')
    end_paths = db.relationship('Path', foreign_keys='Path.end_location_id', backref='end_location', cascade='all, delete-orphan')

class Entrance(db.Model):
    __tablename__ = 'entrance'
    entrance_id = db.Column(db.Integer, primary_key=True)
    building_id = db.Column(db.Integer, db.ForeignKey('building.building_id', ondelete='CASCADE'))
    entrance_name = db.Column(db.Text)
    latitude = db.Column(db.Numeric(9, 6))
    longitude = db.Column(db.Numeric(9, 6))
    floor_level = db.Column(db.Integer)
    wheelchair_accessible = db.Column(db.Boolean)
    updated_at = db.Column(db.DateTime)

class Path(db.Model):
    __tablename__ = 'path'
    path_id = db.Column(db.Integer, primary_key=True)
    start_location_id = db.Column(db.Integer, db.ForeignKey('building.building_id', ondelete='CASCADE'))
    end_location_id = db.Column(db.Integer, db.ForeignKey('building.building_id', ondelete='CASCADE'))
    had_incline = db.Column(db.Boolean)
    has_stairs = db.Column(db.Boolean)
    is_wheelchair_accessible = db.Column(db.Boolean)
    is_paved = db.Column(db.Boolean)
    path_type = db.Column(db.ARRAY(db.String))
    distance = db.Column(db.Numeric(5, 2))
    updated_at = db.Column(db.DateTime)

class Obstacle(db.Model):
    __tablename__ = 'obstacle'
    obstacle_id = db.Column(db.Integer, primary_key=True)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    user_id = db.Column(db.String(50), db.ForeignKey('users.username', ondelete='CASCADE'))
    building_id = db.Column(db.Integer, db.ForeignKey('building.building_id', ondelete='CASCADE'))
    path_id = db.Column(db.Integer, db.ForeignKey('path.path_id', ondelete='CASCADE'))
    entrance_id = db.Column(db.Integer, db.ForeignKey('entrance.entrance_id', ondelete='CASCADE'))
    obstacle_type = db.Column(db.String(50), nullable=False)  # stairs, construction, steep, etc.
    description = db.Column(db.Text)
    severity_level = db.Column(db.Integer)
    reported_at = db.Column(db.DateTime)
    status = db.Column(db.String(50))

class AccessibilityFeature(db.Model):
    feature_id = db.Column(db.Integer, primary_key=True)
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
    
# Add this import at the top if not already present


class ParkingLot(db.Model):
    __tablename__ = 'parking_lots'

    lot_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False, unique=True)
    latitude = db.Column(db.Numeric(10, 7), nullable=False) # Precision for lat/lng
    longitude = db.Column(db.Numeric(10, 7), nullable=False)
    # Use ARRAY of TEXT for permits, allowing multiple permit types per lot
    permits = db.Column(ARRAY(db.Text), nullable=False, default=[])
    capacity = db.Column(db.Integer, nullable=True) # Capacity might not always be known
    # Automatically set creation timestamp
    created_at = db.Column(db.TIMESTAMP(timezone=True), server_default=func.now())
    # Automatically set update timestamp on modification
    updated_at = db.Column(db.TIMESTAMP(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<ParkingLot {self.lot_id}: {self.name}>'

    def to_dict(self):
        """Helper method to convert model instance to dictionary"""
        return {
            'lot_id': self.lot_id,
            'name': self.name,
            # Convert Decimal to float for JSON serialization
            'latitude': float(self.latitude) if self.latitude else None,
            'longitude': float(self.longitude) if self.longitude else None,
            'permits': self.permits if self.permits else [], # Ensure it's always a list
            'capacity': self.capacity,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
