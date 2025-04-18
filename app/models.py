from app import db
from datetime import datetime
from flask_login import UserMixin

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