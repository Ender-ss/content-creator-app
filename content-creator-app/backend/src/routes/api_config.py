from flask import Blueprint, request, jsonify
from src.models.api_config import APIConfig, ProjectData, db
from datetime import datetime
import requests
import json

api_config_bp = Blueprint('api_config', __name__)

# Configurações padrão das APIs
DEFAULT_APIS = [
    {'name': 'youtube', 'type': 'free', 'required': True, 'display_name': 'YouTube Data API'},
    {'name': 'openai', 'type': 'paid', 'required': True, 'display_name': 'OpenAI API'},
    {'name': 'elevenlabs', 'type': 'paid', 'required': False, 'display_name': 'ElevenLabs TTS'},
    {'name': 'replicate', 'type': 'paid', 'required': False, 'display_name': 'Replicate (Imagens)'},
    {'name': 'runway', 'type': 'paid', 'required': False, 'display_name': 'Runway ML'},
]

@api_config_bp.route('/apis', methods=['GET'])
def get_apis():
    """Get all API configurations"""
    try:
        # Initialize default APIs if not exists
        for api_info in DEFAULT_APIS:
            existing = APIConfig.query.filter_by(api_name=api_info['name']).first()
            if not existing:
                api_config = APIConfig(
                    api_name=api_info['name'],
                    api_type=api_info['type'],
                    is_required=api_info['required']
                )
                db.session.add(api_config)
        
        db.session.commit()
        
        # Get all configurations
        apis = APIConfig.query.all()
        api_list = []
        
        for api in apis:
            api_dict = api.to_dict()
            # Add display name
            for default_api in DEFAULT_APIS:
                if default_api['name'] == api.api_name:
                    api_dict['display_name'] = default_api['display_name']
                    break
            api_list.append(api_dict)
        
        return jsonify({
            'success': True,
            'apis': api_list
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@api_config_bp.route('/apis/<api_name>', methods=['PUT'])
def update_api_config(api_name):
    """Update API configuration"""
    try:
        data = request.get_json()
        api_key = data.get('api_key', '').strip()
        
        api_config = APIConfig.query.filter_by(api_name=api_name).first()
        if not api_config:
            return jsonify({
                'success': False,
                'error': 'API configuration not found'
            }), 404
        
        # Update API key
        api_config.set_api_key(api_key)
        
        # Test the API key if provided
        if api_key:
            test_result = test_api_key(api_name, api_key)
            if test_result['success']:
                api_config.status = 'configured'
                api_config.last_tested = datetime.utcnow()
            else:
                api_config.status = 'error'
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'api': api_config.to_dict(),
            'test_result': test_result if api_key else None
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@api_config_bp.route('/apis/<api_name>/test', methods=['POST'])
def test_api_endpoint(api_name):
    """Test API key"""
    try:
        api_config = APIConfig.query.filter_by(api_name=api_name).first()
        if not api_config or not api_config.is_configured:
            return jsonify({
                'success': False,
                'error': 'API not configured'
            }), 400
        
        api_key = api_config.get_api_key()
        test_result = test_api_key(api_name, api_key)
        
        # Update status based on test result
        api_config.status = 'configured' if test_result['success'] else 'error'
        api_config.last_tested = datetime.utcnow()
        db.session.commit()
        
        return jsonify(test_result)
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def test_api_key(api_name, api_key):
    """Test API key functionality"""
    try:
        if api_name == 'youtube':
            # Test YouTube Data API
            url = f"https://www.googleapis.com/youtube/v3/channels?part=id&mine=true&key={api_key}"
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                return {'success': True, 'message': 'YouTube API key is valid'}
            else:
                return {'success': False, 'message': 'Invalid YouTube API key'}
        
        elif api_name == 'openai':
            # Test OpenAI API
            headers = {
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            }
            data = {
                'model': 'gpt-3.5-turbo',
                'messages': [{'role': 'user', 'content': 'Hello'}],
                'max_tokens': 5
            }
            response = requests.post(
                'https://api.openai.com/v1/chat/completions',
                headers=headers,
                json=data,
                timeout=10
            )
            if response.status_code == 200:
                return {'success': True, 'message': 'OpenAI API key is valid'}
            else:
                return {'success': False, 'message': 'Invalid OpenAI API key'}
        
        elif api_name == 'elevenlabs':
            # Test ElevenLabs API
            headers = {'xi-api-key': api_key}
            response = requests.get(
                'https://api.elevenlabs.io/v1/voices',
                headers=headers,
                timeout=10
            )
            if response.status_code == 200:
                return {'success': True, 'message': 'ElevenLabs API key is valid'}
            else:
                return {'success': False, 'message': 'Invalid ElevenLabs API key'}
        
        elif api_name == 'replicate':
            # Test Replicate API
            headers = {'Authorization': f'Token {api_key}'}
            response = requests.get(
                'https://api.replicate.com/v1/account',
                headers=headers,
                timeout=10
            )
            if response.status_code == 200:
                return {'success': True, 'message': 'Replicate API key is valid'}
            else:
                return {'success': False, 'message': 'Invalid Replicate API key'}
        
        else:
            return {'success': False, 'message': 'API testing not implemented for this service'}
    
    except requests.exceptions.Timeout:
        return {'success': False, 'message': 'API request timed out'}
    except Exception as e:
        return {'success': False, 'message': f'Error testing API: {str(e)}'}

@api_config_bp.route('/projects', methods=['GET'])
def get_projects():
    """Get all projects"""
    try:
        projects = ProjectData.query.order_by(ProjectData.updated_at.desc()).all()
        return jsonify({
            'success': True,
            'projects': [project.to_dict() for project in projects]
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@api_config_bp.route('/projects', methods=['POST'])
def create_project():
    """Create new project"""
    try:
        data = request.get_json()
        project_name = data.get('project_name', 'Novo Projeto')
        
        project = ProjectData(project_name=project_name)
        db.session.add(project)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'project': project.to_dict()
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@api_config_bp.route('/projects/<int:project_id>', methods=['GET'])
def get_project(project_id):
    """Get specific project"""
    try:
        project = ProjectData.query.get(project_id)
        if not project:
            return jsonify({
                'success': False,
                'error': 'Project not found'
            }), 404
        
        return jsonify({
            'success': True,
            'project': project.to_dict()
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@api_config_bp.route('/projects/<int:project_id>', methods=['PUT'])
def update_project(project_id):
    """Update project"""
    try:
        data = request.get_json()
        project = ProjectData.query.get(project_id)
        
        if not project:
            return jsonify({
                'success': False,
                'error': 'Project not found'
            }), 404
        
        # Update fields
        if 'project_name' in data:
            project.project_name = data['project_name']
        if 'youtube_url' in data:
            project.youtube_url = data['youtube_url']
        if 'title' in data:
            project.title = data['title']
        if 'summary' in data:
            project.summary = data['summary']
        if 'script' in data:
            project.script = data['script']
        if 'current_step' in data:
            project.current_step = data['current_step']
        if 'project_data' in data:
            project.set_data(data['project_data'])
        
        project.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'project': project.to_dict()
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@api_config_bp.route('/projects/<int:project_id>', methods=['DELETE'])
def delete_project(project_id):
    """Delete project"""
    try:
        project = ProjectData.query.get(project_id)
        if not project:
            return jsonify({
                'success': False,
                'error': 'Project not found'
            }), 404
        
        db.session.delete(project)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Project deleted successfully'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

