from src.models.user import db
from datetime import datetime
import json
from cryptography.fernet import Fernet
import os

class APIConfig(db.Model):
    __tablename__ = 'api_configs'
    
    id = db.Column(db.Integer, primary_key=True)
    api_name = db.Column(db.String(50), nullable=False, unique=True)
    api_key_encrypted = db.Column(db.Text, nullable=True)
    api_type = db.Column(db.String(20), nullable=False)  # 'free' or 'paid'
    is_required = db.Column(db.Boolean, default=False)
    is_configured = db.Column(db.Boolean, default=False)
    status = db.Column(db.String(20), default='not_configured')  # not_configured, configured, error
    last_tested = db.Column(db.DateTime, nullable=True)
    usage_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __init__(self, api_name, api_type, is_required=False):
        self.api_name = api_name
        self.api_type = api_type
        self.is_required = is_required
        
    @staticmethod
    def get_encryption_key():
        """Get or create encryption key for API keys"""
        key_file = os.path.join(os.path.dirname(__file__), '..', 'encryption.key')
        if os.path.exists(key_file):
            with open(key_file, 'rb') as f:
                return f.read()
        else:
            key = Fernet.generate_key()
            with open(key_file, 'wb') as f:
                f.write(key)
            return key
    
    def set_api_key(self, api_key):
        """Encrypt and store API key"""
        if api_key:
            key = self.get_encryption_key()
            f = Fernet(key)
            self.api_key_encrypted = f.encrypt(api_key.encode()).decode()
            self.is_configured = True
            self.status = 'configured'
        else:
            self.api_key_encrypted = None
            self.is_configured = False
            self.status = 'not_configured'
        self.updated_at = datetime.utcnow()
    
    def get_api_key(self):
        """Decrypt and return API key"""
        if not self.api_key_encrypted:
            return None
        key = self.get_encryption_key()
        f = Fernet(key)
        return f.decrypt(self.api_key_encrypted.encode()).decode()
    
    def increment_usage(self):
        """Increment usage counter"""
        self.usage_count += 1
        db.session.commit()
    
    def to_dict(self):
        """Convert to dictionary for JSON response"""
        return {
            'id': self.id,
            'api_name': self.api_name,
            'api_type': self.api_type,
            'is_required': self.is_required,
            'is_configured': self.is_configured,
            'status': self.status,
            'last_tested': self.last_tested.isoformat() if self.last_tested else None,
            'usage_count': self.usage_count,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class ProjectData(db.Model):
    __tablename__ = 'project_data'
    
    id = db.Column(db.Integer, primary_key=True)
    project_name = db.Column(db.String(100), nullable=False)
    youtube_url = db.Column(db.Text, nullable=True)
    title = db.Column(db.Text, nullable=True)
    summary = db.Column(db.Text, nullable=True)
    script = db.Column(db.Text, nullable=True)
    current_step = db.Column(db.Integer, default=0)
    project_data = db.Column(db.Text, nullable=True)  # JSON string
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def set_data(self, data):
        """Store project data as JSON"""
        self.project_data = json.dumps(data)
        self.updated_at = datetime.utcnow()
    
    def get_data(self):
        """Get project data from JSON"""
        if self.project_data:
            return json.loads(self.project_data)
        return {}
    
    def to_dict(self):
        """Convert to dictionary for JSON response"""
        return {
            'id': self.id,
            'project_name': self.project_name,
            'youtube_url': self.youtube_url,
            'title': self.title,
            'summary': self.summary,
            'script': self.script,
            'current_step': self.current_step,
            'project_data': self.get_data(),
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

