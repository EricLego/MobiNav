import os

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "your_secret_key")
    
    # This is the problematic line - it's using a generic/ODBC format
    # SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "sqlite:///mobinav.db")
    
    # Update to use PostgreSQL directly with psycopg2
    # Update to use PostgreSQL connection to remote server
    SQLALCHEMY_DATABASE_URI = "postgresql://postgres:yui19M<>@10.96.33.120:5432/mobinav"
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False