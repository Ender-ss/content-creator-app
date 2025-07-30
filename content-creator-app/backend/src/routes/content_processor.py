from flask import Blueprint, request, jsonify
from src.models.api_config import APIConfig, ProjectData, db
import requests
import json
import re
import time
from datetime import datetime
import openai
import os
import base64
import wave
import io

# Import AI libraries at module level
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

try:
    import anthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False

# Try to import new Google GenAI library for TTS
try:
    import google.genai as google_genai
    from google.genai import types
    GOOGLE_GENAI_TTS_AVAILABLE = True
    print("DEBUG: Google GenAI TTS library imported successfully!")
except ImportError as e:
    GOOGLE_GENAI_TTS_AVAILABLE = False
    print(f"DEBUG: Failed to import Google GenAI TTS library: {e}")
    google_genai = None
    types = None

content_processor_bp = Blueprint('content_processor', __name__)

@content_processor_bp.route('/extract-youtube', methods=['POST'])
def extract_youtube_channel_content():
    """Extract content from YouTube channel using RapidAPI YouTube V2"""
    try:
        data = request.get_json()
        url = data.get('url', '').strip()
        api_key = data.get('api_key', '').strip()
        config = data.get('config', {})
        
        print(f"DEBUG: Received data: {data}")
        print(f"DEBUG: URL: {url}")
        print(f"DEBUG: API Key length: {len(api_key) if api_key else 0}")
        
        if not url:
            return jsonify({
                'success': False,
                'error': 'URL ou ID do canal é obrigatório'
            }), 400
        
        if not api_key:
            return jsonify({
                'success': False,
                'error': 'Chave da API RapidAPI é obrigatória'
            }), 400
        
        # Determine if input is channel ID or URL/name
        channel_id = None
        channel_name = None
        
        # Check if it's already a channel ID (starts with UC and has 24 characters)
        if url.startswith('UC') and len(url) == 24:
            channel_id = url
            print(f"DEBUG: Using direct channel ID: {channel_id}")
        else:
            # Try to extract channel name from URL
            channel_name = extract_channel_name_or_id(url)
            if not channel_name:
                return jsonify({
                    'success': False,
                    'error': 'Formato inválido. Use: @NomeDoCanal, URL completa ou ID do canal (UCxxxxxxxxx)'
                }), 400
            
            print(f"DEBUG: Extracted channel name: {channel_name}")
            
            # Get channel ID from name
            channel_id_result = get_channel_id_rapidapi(channel_name, api_key)
            if not channel_id_result['success']:
                return jsonify(channel_id_result), 400
            
            channel_id = channel_id_result['data']['channel_id']
            print(f"DEBUG: Got channel ID: {channel_id}")
        
        # Get channel videos
        videos_result = get_channel_videos_rapidapi(channel_id, api_key)
        if not videos_result['success']:
            return jsonify(videos_result), 400
        
        print(f"DEBUG: Got {len(videos_result['data']['videos'])} videos")
        
        # Get channel details
        channel_details = get_channel_details_rapidapi(channel_id, api_key)
        
        # Filter videos based on config
        filtered_videos = filter_videos_by_config(videos_result['data']['videos'], config)
        
        print(f"DEBUG: Filtered to {len(filtered_videos)} videos")
        
        return jsonify({
            'success': True,
            'titles': filtered_videos,
            'channelId': channel_id,
            'channelName': channel_details['data']['title'] if channel_details['success'] else (channel_name or channel_id),
            'channelDescription': channel_details['data']['description'] if channel_details['success'] else '',
            'totalViews': sum(int(video.get('views', 0)) for video in filtered_videos),
            'totalLikes': sum(int(video.get('like_count', 0)) for video in filtered_videos),
            'totalComments': sum(int(video.get('comment_count', 0)) for video in filtered_videos)
        })
    
    except Exception as e:
        print(f"DEBUG: Exception occurred: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': f'Erro interno: {str(e)}'
        }), 500

@content_processor_bp.route('/generate-title', methods=['POST'])
def generate_sensational_title():
    """Generate sensational title using AI"""
    try:
        data = request.get_json()
        original_title = data.get('original_title', '').strip()
        summary = data.get('summary', '').strip()
        project_id = data.get('project_id')
        
        if not original_title and not summary:
            return jsonify({
                'success': False,
                'error': 'Original title or summary is required'
            }), 400
        
        # Get OpenAI API configuration
        openai_api = APIConfig.query.filter_by(api_name='openai').first()
        if not openai_api or not openai_api.is_configured:
            return jsonify({
                'success': False,
                'error': 'OpenAI API not configured'
            }), 400
        
        api_key = openai_api.get_api_key()
        
        # Generate title using OpenAI
        generated_title = generate_title_with_ai(original_title, summary, api_key)
        if not generated_title['success']:
            return jsonify(generated_title), 400
        
        # Update project if provided
        if project_id:
            project = ProjectData.query.get(project_id)
            if project:
                project.title = generated_title['data']['title']
                project.current_step = 2
                db.session.commit()
        
        # Increment usage counter
        openai_api.increment_usage()
        
        return jsonify({
            'success': True,
            'data': generated_title['data']
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@content_processor_bp.route('/generate-script', methods=['POST'])
def generate_script():
    """Generate script from title and summary"""
    try:
        data = request.get_json()
        title = data.get('title', '').strip()
        summary = data.get('summary', '').strip()
        project_id = data.get('project_id')
        chapters = data.get('chapters', 10)
        
        if not title:
            return jsonify({
                'success': False,
                'error': 'Title is required'
            }), 400
        
        # Get OpenAI API configuration
        openai_api = APIConfig.query.filter_by(api_name='openai').first()
        if not openai_api or not openai_api.is_configured:
            return jsonify({
                'success': False,
                'error': 'OpenAI API not configured'
            }), 400
        
        api_key = openai_api.get_api_key()
        
        # Generate script using OpenAI
        generated_script = generate_script_with_ai(title, summary, chapters, api_key)
        if not generated_script['success']:
            return jsonify(generated_script), 400
        
        # Update project if provided
        if project_id:
            project = ProjectData.query.get(project_id)
            if project:
                project.script = generated_script['data']['script']
                project.current_step = 3
                db.session.commit()
        
        # Increment usage counter
        openai_api.increment_usage()
        
        return jsonify({
            'success': True,
            'data': generated_script['data']
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@content_processor_bp.route('/generate-titles', methods=['POST'])
def generate_titles_with_ai():
    """Generate multiple titles using different AI agents"""
    try:
        data = request.get_json()
        agent = data.get('agent', 'gemini').lower()
        api_key = data.get('api_key', '').strip()
        instructions = data.get('instructions', '').strip()
        source_titles = data.get('source_titles', [])
        
        print(f"DEBUG: Generate titles request - Agent: {agent}, Titles count: {len(source_titles)}")
        
        if not api_key:
            return jsonify({
                'success': False,
                'error': f'Chave da API {agent.upper()} é obrigatória'
            }), 400
        
        if not source_titles:
            return jsonify({
                'success': False,
                'error': 'Títulos de origem são obrigatórios'
            }), 400
        
        if not instructions:
            instructions = 'Crie títulos virais e chamativos baseados nos títulos fornecidos. Mantenha o mesmo tom e estilo, mas torne-os mais atrativos para o público brasileiro do YouTube.'
        
        # Generate titles based on the selected agent
        if agent == 'chatgpt' or agent == 'openai':
            result = generate_titles_with_openai(source_titles, instructions, api_key)
        elif agent == 'claude':
            result = generate_titles_with_claude(source_titles, instructions, api_key)
        elif agent == 'gemini':
            result = generate_titles_with_gemini(source_titles, instructions, api_key)
        elif agent == 'openrouter':
            result = generate_titles_with_openrouter(source_titles, instructions, api_key)
        else:
            return jsonify({
                'success': False,
                'error': f'Agente {agent} não suportado'
            }), 400
        
        return jsonify(result)
    
    except Exception as e:
        print(f"DEBUG: Exception in generate_titles_with_ai: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': f'Erro interno: {str(e)}'
        }), 500

@content_processor_bp.route('/generate-script-chapters', methods=['POST'])
def generate_script_chapters():
    """Generate complete script with multiple chapters using AI agents"""
    try:
        data = request.get_json()
        agent = data.get('agent', 'chatgpt').lower()
        api_key = data.get('api_key', '').strip()
        title = data.get('title', '').strip()
        context = data.get('context', '').strip()
        num_chapters = data.get('num_chapters', 10)
        
        print(f"DEBUG: Generate script request - Agent: {agent}, Title: {title[:50]}...")
        
        if not api_key:
            return jsonify({
                'success': False,
                'error': f'Chave da API {agent.upper()} é obrigatória'
            }), 400
        
        if not title:
            return jsonify({
                'success': False,
                'error': 'Título é obrigatório'
            }), 400
        
        # Generate script chapters based on the selected agent
        if agent == 'chatgpt' or agent == 'openai':
            result = generate_script_chapters_with_openai(title, context, num_chapters, api_key)
        elif agent == 'claude':
            result = generate_script_chapters_with_claude(title, context, num_chapters, api_key)
        elif agent == 'gemini':
            result = generate_script_chapters_with_gemini(title, context, num_chapters, api_key)
        elif agent == 'openrouter':
            result = generate_script_chapters_with_openrouter(title, context, num_chapters, api_key)
        else:
            return jsonify({
                'success': False,
                'error': f'Agente {agent} não suportado'
            }), 400
        
        return jsonify(result)

    except Exception as e:
        print(f"DEBUG: Exception in generate_script_chapters: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': f'Erro interno: {str(e)}'
        }), 500

@content_processor_bp.route('/generate-premise', methods=['POST'])
def generate_premise_with_ai():
    """Generate narrative premise using different AI agents"""
    try:
        data = request.get_json()
        agent = data.get('agent', 'gemini').lower()
        api_key = data.get('api_key', '').strip()
        title = data.get('title', '').strip()
        resume = data.get('resume', '').strip()
        agent_prompt = data.get('agent_prompt', '').strip()

        print(f"DEBUG: Generate premise request - Agent: {agent}, Title: {title[:50]}...")

        if not api_key:
            return jsonify({
                'success': False,
                'error': f'Chave da API {agent.upper()} é obrigatória'
            }), 400

        if not title:
            return jsonify({
                'success': False,
                'error': 'Título é obrigatório'
            }), 400

        # Use default premise prompt if not provided
        if not agent_prompt:
            agent_prompt = """# Gerador Automático de Premissas Narrativas

Você é um sofisticado gerador de premissas narrativas. Ao receber uma frase do usuário, execute automaticamente todas as seguintes etapas internamente. O processo deve ocorrer sem solicitar interação do usuário, e apenas a premissa final deve ser apresentada como resultado.

PROCESSO AUTOMÁTICO DE TRANSFORMAÇÃO (INTERNO):

ETAPA 01: CONSTRUÇÃO DO CONCEITO BASE
- Transforme a frase original em um conceito narrativo central
- Identifique o potencial dramático e os elementos que podem ser expandidos
- Esta etapa serve de estrutura para o desenvolvimento da premissa

ETAPA 02: DESENVOLVIMENTO DO RESUMO INICIAL
- Expanda o conceito em um resumo inicial de um parágrafo
- Incorpore elementos de um dos cinco grupos temáticos:
  1. Vulnerabilidade e Impacto Social
  2. Sobrenatural e Coincidências
  3. Segredos Familiares
  4. Transformação Pessoal
  5. Compromissos Surpreendentes
- Adicione personagens bem definidos
- Estabeleça um contexto específico
- Crie uma situação dramática inicial

ETAPA 03: IDENTIFICAÇÃO DE ELEMENTOS AUSENTES
- Analise o resumo inicial e identifique:
  - Conflitos pouco desenvolvidos
  - Motivações superficiais dos personagens
  - Reviravoltas insuficientes
  - Elementos de tensão ausentes
  - Potencial dramático inexplorado
  - Conexões emocionais fracas

ETAPA 04: ENRIQUECIMENTO DA PREMISSA
- Reescreva o resumo incorporando os elementos identificados como ausentes
- Adicione:
  - Um conflito interno para o protagonista
  - Um antagonista ou força de oposição clara
  - Uma reviravolta central inesperada
  - Consequências emocionais significativas
  - Um elemento de mistério ou segredo a ser revelado
  - Stakes (o que está em jogo) elevados e pessoais

ETAPA 05: REFINAMENTO E INTENSIFICAÇÃO
- Aprimorar a premissa para maximizar impacto emocional e narrativo:
  - Fortalecer motivações dos personagens
  - Intensificar conflitos
  - Tornar reviravoltas mais surpreendentes
  - Elevar consequências e riscos
  - Aprofundar conexões entre personagens
  - Adicionar camadas de complexidade à situação principal

ETAPA 06: FINALIZAÇÃO DA PREMISSA
- Reescrever a premissa como texto corrido fluido e envolvente
- Garantir equilíbrio entre:
  - Profundidade emocional e psicológica
  - Plausibilidade dentro do mundo da história
  - Potencial para desenvolvimento narrativo
  - Clareza da linha narrativa principal
  - Gancho final que estimula curiosidade

ETAPA 07: POLIMENTO FINAL
- Revisar a premissa completa, garantindo:
  - Ritmo narrativo fluido
  - Ausência de inconsistências internas
  - Linguagem vívida e envolvente
  - Coerência temática
  - Impacto emocional máximo
  - Originalidade e frescor na abordagem

Apresente ao usuário SOMENTE a premissa final completa em texto corrido (resultado da Etapa 07). Não inclua título, explicações, etapas intermediárias ou qualquer outro elemento além da premissa em si."""

        # Generate premise based on the selected agent
        if agent == 'chatgpt' or agent == 'openai':
            result = generate_premise_with_openai(title, resume, agent_prompt, api_key)
        elif agent == 'claude':
            result = generate_premise_with_claude(title, resume, agent_prompt, api_key)
        elif agent == 'gemini':
            result = generate_premise_with_gemini(title, resume, agent_prompt, api_key)
        elif agent == 'openrouter':
            result = generate_premise_with_openrouter(title, resume, agent_prompt, api_key)
        else:
            return jsonify({
                'success': False,
                'error': f'Agente {agent} não suportado'
            }), 400

        return jsonify(result)

    except Exception as e:
        print(f"DEBUG: Exception in generate_premise: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': f'Erro interno: {str(e)}'
        }), 500

@content_processor_bp.route('/generate-tts-gemini', methods=['POST'])
def generate_tts_gemini():
    """Generate TTS audio using Gemini 2.5 TTS models"""
    try:
        data = request.get_json()
        text = data.get('text', '').strip()
        api_key = data.get('api_key', '').strip()
        voice_name = data.get('voice_name', 'Kore')  # Default voice
        model = data.get('model', 'gemini-2.5-flash-preview-tts')  # Default model

        print(f"DEBUG: TTS request - Text length: {len(text)}, Voice: {voice_name}, Model: {model}")

        if not text:
            return jsonify({
                'success': False,
                'error': 'Texto é obrigatório'
            }), 400

        if not api_key:
            return jsonify({
                'success': False,
                'error': 'Chave da API Gemini é obrigatória'
            }), 400

        if not GOOGLE_GENAI_TTS_AVAILABLE:
            return jsonify({
                'success': False,
                'error': 'Biblioteca google-genai não instalada. Execute: pip install google-genai'
            }), 400

        # Generate TTS audio using Gemini
        result = generate_tts_with_gemini(text, api_key, voice_name, model)
        return jsonify(result)

    except Exception as e:
        print(f"DEBUG: Exception in generate_tts_gemini: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': f'Erro interno do servidor: {str(e)}'
        }), 500

def extract_video_id(url):
    """Extract video ID from YouTube URL"""
    patterns = [
        r'(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)',
        r'youtube\.com\/watch\?.*v=([^&\n?#]+)'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None

def get_youtube_video_info(video_id, api_key):
    """Get video information from YouTube API"""
    try:
        url = f"https://www.googleapis.com/youtube/v3/videos"
        params = {
            'part': 'snippet,statistics',
            'id': video_id,
            'key': api_key
        }
        
        response = requests.get(url, params=params, timeout=10)
        
        if response.status_code != 200:
            return {
                'success': False,
                'error': 'Failed to fetch video information'
            }
        
        data = response.json()
        
        if not data.get('items'):
            return {
                'success': False,
                'error': 'Video not found'
            }
        
        video = data['items'][0]
        snippet = video['snippet']
        statistics = video['statistics']
        
        return {
            'success': True,
            'data': {
                'title': snippet['title'],
                'description': snippet['description'],
                'channel_title': snippet['channelTitle'],
                'published_at': snippet['publishedAt'],
                'view_count': statistics.get('viewCount', 0),
                'like_count': statistics.get('likeCount', 0),
                'comment_count': statistics.get('commentCount', 0)
            }
        }
    
    except Exception as e:
        return {
            'success': False,
            'error': f'Error fetching video info: {str(e)}'
        }

def get_youtube_captions(video_id, api_key):
    """Get video captions from YouTube API"""
    try:
        # First, get caption tracks
        url = f"https://www.googleapis.com/youtube/v3/captions"
        params = {
            'part': 'snippet',
            'videoId': video_id,
            'key': api_key
        }
        
        response = requests.get(url, params=params, timeout=10)
        
        if response.status_code != 200:
            return {
                'success': False,
                'error': 'Failed to fetch captions'
            }
        
        data = response.json()
        
        if not data.get('items'):
            return {
                'success': False,
                'error': 'No captions available'
            }
        
        # For now, just return that captions exist
        # Note: Downloading actual caption content requires OAuth
        return {
            'success': True,
            'data': {
                'available': True,
                'tracks': len(data['items']),
                'message': 'Captions available but require OAuth for download'
            }
        }
    
    except Exception as e:
        return {
            'success': False,
            'error': f'Error fetching captions: {str(e)}'
        }

def generate_title_with_ai(original_title, summary, api_key):
    """Generate sensational title using OpenAI"""
    try:
        client = openai.OpenAI(api_key=api_key)
        
        prompt = f"""
        Você é um especialista em criar títulos sensacionalistas para YouTube que geram muitas visualizações.
        
        Título original: {original_title}
        Resumo do conteúdo: {summary}
        
        Crie um título sensacionalista que:
        - Tenha entre 80-90 caracteres
        - Use palavras em MAIÚSCULO para impacto
        - Crie curiosidade e urgência
        - Seja dramático mas relacionado ao conteúdo
        - Use elementos como: CHOQUE, INACREDITÁVEL, REVELAÇÃO, etc.
        
        Retorne apenas o título, sem explicações.
        """
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=100,
            temperature=0.8
        )
        
        generated_title = response.choices[0].message.content.strip()
        
        return {
            'success': True,
            'data': {
                'title': generated_title,
                'character_count': len(generated_title),
                'original_title': original_title
            }
        }
    
    except Exception as e:
        return {
            'success': False,
            'error': f'Error generating title: {str(e)}'
        }

def generate_script_with_ai(title, summary, chapters, api_key):
    """Generate script using OpenAI"""
    try:
        client = openai.OpenAI(api_key=api_key)
        
        prompt = f"""
        Você é um roteirista especializado em conteúdo viral para YouTube.
        
        Título: {title}
        Resumo: {summary}
        Número de capítulos: {chapters}
        
        Crie um roteiro completo dividido em {chapters} capítulos com:
        - Cada capítulo com aproximadamente 500 palavras
        - Linguagem cinematográfica e dramática
        - Reviravoltas e suspense
        - CTAs (Call to Action) entre capítulos
        - Final impactante com CTA forte
        
        Formato:
        CAPÍTULO 1: [Título do capítulo]
        [Conteúdo do capítulo]
        
        CAPÍTULO 2: [Título do capítulo]
        [Conteúdo do capítulo]
        
        E assim por diante...
        """
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=4000,
            temperature=0.7
        )
        
        generated_script = response.choices[0].message.content.strip()
        
        # Parse chapters
        chapters_list = []
        current_chapter = None
        current_content = []
        
        for line in generated_script.split('\n'):
            if line.startswith('CAPÍTULO'):
                if current_chapter:
                    chapters_list.append({
                        'title': current_chapter,
                        'content': '\n'.join(current_content).strip()
                    })
                current_chapter = line
                current_content = []
            else:
                current_content.append(line)
        
        # Add last chapter
        if current_chapter:
            chapters_list.append({
                'title': current_chapter,
                'content': '\n'.join(current_content).strip()
            })
        
        return {
            'success': True,
            'data': {
                'script': generated_script,
                'chapters': chapters_list,
                'total_chapters': len(chapters_list),
                'estimated_words': len(generated_script.split())
            }
        }
    
    except Exception as e:
        return {
            'success': False,
            'error': f'Error generating script: {str(e)}'
        }


def extract_channel_name_or_id(input_str):
    """Extract channel name or ID from YouTube URL or direct input"""
    input_str = input_str.strip()
    
    # Check if it's already a channel ID (starts with UC and has 24 characters)
    if input_str.startswith('UC') and len(input_str) == 24:
        return input_str
    
    # Patterns for extracting channel name from URLs
    patterns = [
        r'youtube\.com/@([^/?&\s]+)',
        r'youtube\.com/c/([^/?&\s]+)',
        r'youtube\.com/channel/([^/?&\s]+)',
        r'youtube\.com/user/([^/?&\s]+)',
        r'^@([^/?&\s]+)$',
        r'^([^/?&\s@]+)$'  # Direct channel name without @
    ]
    
    for pattern in patterns:
        match = re.search(pattern, input_str)
        if match:
            extracted = match.group(1)
            # If it's a channel ID from URL, return it directly
            if extracted.startswith('UC') and len(extracted) == 24:
                return extracted
            # Otherwise return the channel name
            return extracted
    
    return None

def get_channel_id_rapidapi(channel_name, api_key):
    """Get channel ID using RapidAPI YouTube V2"""
    try:
        url = "https://youtube-v2.p.rapidapi.com/channel/id"
        
        headers = {
            "X-RapidAPI-Key": api_key,
            "X-RapidAPI-Host": "youtube-v2.p.rapidapi.com"
        }
        
        params = {
            "channel_name": channel_name
        }
        
        response = requests.get(url, headers=headers, params=params, timeout=10)
        
        if response.status_code != 200:
            return {
                'success': False,
                'error': f'Erro na API RapidAPI: {response.status_code}'
            }
        
        data = response.json()
        
        if 'channel_id' not in data:
            return {
                'success': False,
                'error': 'Canal não encontrado'
            }
        
        return {
            'success': True,
            'data': {
                'channel_id': data['channel_id'],
                'channel_name': data.get('channel_name', channel_name)
            }
        }
    
    except Exception as e:
        return {
            'success': False,
            'error': f'Erro ao buscar ID do canal: {str(e)}'
        }

def get_channel_details_rapidapi(channel_id, api_key):
    """Get channel details using RapidAPI YouTube V2"""
    try:
        url = "https://youtube-v2.p.rapidapi.com/channel/details"
        
        headers = {
            "X-RapidAPI-Key": api_key,
            "X-RapidAPI-Host": "youtube-v2.p.rapidapi.com"
        }
        
        params = {
            "channel_id": channel_id
        }
        
        response = requests.get(url, headers=headers, params=params, timeout=10)
        
        if response.status_code != 200:
            return {
                'success': False,
                'error': f'Erro ao buscar detalhes do canal: {response.status_code}'
            }
        
        data = response.json()
        
        return {
            'success': True,
            'data': {
                'title': data.get('title', ''),
                'description': data.get('description', ''),
                'subscriber_count': data.get('subscriber_count', 0),
                'video_count': data.get('video_count', 0)
            }
        }
    
    except Exception as e:
        return {
            'success': False,
            'error': f'Erro ao buscar detalhes do canal: {str(e)}'
        }

def get_channel_videos_rapidapi(channel_id, api_key):
    """Get channel videos using RapidAPI YouTube V2"""
    try:
        url = "https://youtube-v2.p.rapidapi.com/channel/videos"
        
        headers = {
            "X-RapidAPI-Key": api_key,
            "X-RapidAPI-Host": "youtube-v2.p.rapidapi.com"
        }
        
        params = {
            "channel_id": channel_id
        }
        
        print(f"DEBUG: Making request to {url} with params: {params}")
        
        response = requests.get(url, headers=headers, params=params, timeout=15)
        
        print(f"DEBUG: Response status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"DEBUG: Error response: {response.text}")
            return {
                'success': False,
                'error': f'Erro ao buscar vídeos do canal: {response.status_code}'
            }
        
        data = response.json()
        
        print(f"DEBUG: Response keys: {list(data.keys())}")
        
        if 'videos' not in data:
            print(f"DEBUG: No 'videos' key found. Available keys: {list(data.keys())}")
            print(f"DEBUG: Full response: {json.dumps(data, indent=2)[:500]}...")
            return {
                'success': False,
                'error': 'Nenhum vídeo encontrado'
            }
        
        videos = data['videos']
        print(f"DEBUG: Found {len(videos)} videos")
        
        if videos and len(videos) > 0:
            print(f"DEBUG: First video structure: {json.dumps(videos[0], indent=2)[:300]}...")
        
        return {
            'success': True,
            'data': {
                'videos': videos
            }
        }
    
    except Exception as e:
        print(f"DEBUG: Exception in get_channel_videos_rapidapi: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            'success': False,
            'error': f'Erro ao buscar vídeos: {str(e)}'
        }

def filter_videos_by_config(videos, config):
    """Filter videos based on user configuration"""
    try:
        max_titles = config.get('maxTitles', 3)
        min_views = config.get('minViews', 1000)
        days_period = config.get('daysPeriod', 3)
        
        print(f"DEBUG: Filtering {len(videos)} videos with config: {config}")
        
        filtered_videos = []
        
        for i, video in enumerate(videos):
            print(f"DEBUG: Processing video {i+1}: {video.get('title', 'No title')[:50]}...")
            
            # Parse view count - use the correct field from API
            view_count = 0
            if 'number_of_views' in video and video['number_of_views'] is not None:
                try:
                    view_count = int(video['number_of_views'])
                    print(f"DEBUG: Found view count: {view_count}")
                except (ValueError, TypeError):
                    print(f"DEBUG: Could not parse number_of_views: {video['number_of_views']}")
                    view_count = 0
            else:
                print(f"DEBUG: No number_of_views field found")
            
            # Parse published date
            published_at = video.get('published_at', video.get('publishedAt', ''))
            days_diff = 0
            
            if published_at:
                try:
                    from datetime import datetime, timedelta
                    # Try different date formats
                    if 'T' in published_at:
                        published_date = datetime.fromisoformat(published_at.replace('Z', '+00:00'))
                    else:
                        # Try parsing other formats
                        published_date = datetime.strptime(published_at, '%Y-%m-%d')
                    
                    days_diff = (datetime.now() - published_date.replace(tzinfo=None)).days
                    print(f"DEBUG: Video published {days_diff} days ago")
                except Exception as e:
                    print(f"DEBUG: Date parsing failed: {e}, including video anyway")
                    days_diff = 0  # Include if date parsing fails
            
            # Apply filters - be more lenient
            include_video = True
            
            if view_count < min_views:
                print(f"DEBUG: Excluding video - views {view_count} < min {min_views}")
                include_video = False
            
            if days_period > 0 and published_at and days_diff > days_period:
                print(f"DEBUG: Excluding video - {days_diff} days > {days_period} days period")
                include_video = False
            
            if include_video:
                print(f"DEBUG: Including video: {video.get('title', 'No title')[:30]}... ({view_count} views)")
                # Handle thumbnail safely
                thumbnail_url = ''
                if 'thumbnail' in video:
                    thumbnail_url = video['thumbnail']
                elif 'thumbnails' in video:
                    thumbnails = video['thumbnails']
                    if isinstance(thumbnails, dict) and 'default' in thumbnails:
                        thumbnail_url = thumbnails['default'].get('url', '')
                    elif isinstance(thumbnails, list) and len(thumbnails) > 0:
                        thumbnail_url = thumbnails[0] if isinstance(thumbnails[0], str) else ''
                
                filtered_videos.append({
                    'videoId': video.get('video_id', video.get('id', '')),
                    'title': video.get('title', ''),
                    'description': video.get('description', '')[:200] + '...' if video.get('description', '') else '',
                    'views': view_count,
                    'publishedAt': published_at,
                    'thumbnail': thumbnail_url,
                    'duration': video.get('video_length', video.get('duration', '')),
                    'like_count': video.get('like_count', video.get('likes', 0)),
                    'comment_count': video.get('comment_count', video.get('comments', 0))
                })
        
        print(f"DEBUG: After filtering: {len(filtered_videos)} videos")
        
        # Sort by views (descending) and limit to max_titles
        filtered_videos.sort(key=lambda x: x['views'], reverse=True)
        result = filtered_videos[:max_titles]
        
        print(f"DEBUG: Final result: {len(result)} videos")
        return result
    
    except Exception as e:
        print(f"Error filtering videos: {str(e)}")
        import traceback
        traceback.print_exc()
        return []

def generate_titles_with_openai(source_titles, instructions, api_key):
    """Generate titles using OpenAI ChatGPT"""
    try:
        client = openai.OpenAI(api_key=api_key)
        
        titles_text = '\n'.join([f"- {title}" for title in source_titles])
        
        prompt = f"""
        {instructions}
        
        Títulos de origem:
        {titles_text}
        
        Gere 5 novos títulos virais baseados nos títulos acima. Cada título deve:
        - Ter entre 60-100 caracteres
        - Ser chamativo e viral
        - Manter o tema dos títulos originais
        - Usar técnicas de copywriting para YouTube
        - Ser adequado para o público brasileiro
        
        Retorne apenas os 5 títulos, um por linha, sem numeração ou formatação extra.
        """
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=500,
            temperature=0.8
        )
        
        generated_text = response.choices[0].message.content.strip()
        titles = [title.strip() for title in generated_text.split('\n') if title.strip()]
        
        return {
            'success': True,
            'generated_titles': titles[:5]  # Ensure max 5 titles
        }
    
    except Exception as e:
        return {
            'success': False,
            'error': f'Erro ao gerar títulos com ChatGPT: {str(e)}'
        }

def generate_titles_with_claude(source_titles, instructions, api_key):
    """Generate titles using Anthropic Claude"""
    try:
        if not ANTHROPIC_AVAILABLE:
            return {
                'success': False,
                'error': 'Biblioteca anthropic não instalada. Execute: pip install anthropic'
            }
        
        client = anthropic.Anthropic(api_key=api_key)
        
        titles_text = '\n'.join([f"- {title}" for title in source_titles])
        
        prompt = f"""
        {instructions}
        
        Títulos de origem:
        {titles_text}
        
        Gere 5 novos títulos virais baseados nos títulos acima. Cada título deve:
        - Ter entre 60-100 caracteres
        - Ser chamativo e viral
        - Manter o tema dos títulos originais
        - Usar técnicas de copywriting para YouTube
        - Ser adequado para o público brasileiro
        
        Retorne apenas os 5 títulos, um por linha, sem numeração ou formatação extra.
        """
        
        response = client.messages.create(
            model="claude-3-sonnet-20240229",
            max_tokens=500,
            messages=[{"role": "user", "content": prompt}]
        )
        
        generated_text = response.content[0].text.strip()
        titles = [title.strip() for title in generated_text.split('\n') if title.strip()]
        
        return {
            'success': True,
            'generated_titles': titles[:5]  # Ensure max 5 titles
        }
    
    except Exception as e:
        return {
            'success': False,
            'error': f'Erro ao gerar títulos com Claude: {str(e)}'
        }

def generate_titles_with_gemini(source_titles, instructions, api_key):
    """Generate titles using Google Gemini"""
    try:
        if not GEMINI_AVAILABLE:
            return {
                'success': False,
                'error': 'Biblioteca google-generativeai não instalada. Execute: pip install google-generativeai'
            }
        
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        titles_text = '\n'.join([f"- {title}" for title in source_titles])
        
        prompt = f"""
        {instructions}
        
        Títulos de origem:
        {titles_text}
        
        Gere 5 novos títulos virais baseados nos títulos acima. Cada título deve:
        - Ter entre 60-100 caracteres
        - Ser chamativo e viral
        - Manter o tema dos títulos originais
        - Usar técnicas de copywriting para YouTube
        - Ser adequado para o público brasileiro
        
        Retorne apenas os 5 títulos, um por linha, sem numeração ou formatação extra.
        """
        
        response = model.generate_content(prompt)
        
        if not response.text:
            return {
                'success': False,
                'error': 'Gemini não retornou conteúdo. Verifique sua chave de API.'
            }
        
        generated_text = response.text.strip()
        titles = [title.strip() for title in generated_text.split('\n') if title.strip()]
        
        if not titles:
            return {
                'success': False,
                'error': 'Nenhum título foi gerado pelo Gemini.'
            }
        
        return {
            'success': True,
            'generated_titles': titles[:5]  # Ensure max 5 titles
        }
    
    except Exception as e:
        return {
            'success': False,
            'error': f'Erro ao gerar títulos com Gemini: {str(e)}'
        }

def generate_titles_with_openrouter(source_titles, instructions, api_key):
    """Generate titles using OpenRouter"""
    try:
        import requests
        
        titles_text = '\n'.join([f"- {title}" for title in source_titles])
        
        prompt = f"""
        {instructions}
        
        Títulos de origem:
        {titles_text}
        
        Gere 5 novos títulos virais baseados nos títulos acima. Cada título deve:
        - Ter entre 60-100 caracteres
        - Ser chamativo e viral
        - Manter o tema dos títulos originais
        - Usar técnicas de copywriting para YouTube
        - Ser adequado para o público brasileiro
        
        Retorne apenas os 5 títulos, um por linha, sem numeração ou formatação extra.
        """
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": "anthropic/claude-3-sonnet",
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 500,
            "temperature": 0.8
        }
        
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=data,
            timeout=30
        )
        
        if response.status_code != 200:
            raise Exception(f"OpenRouter API error: {response.status_code}")
        
        result = response.json()
        generated_text = result['choices'][0]['message']['content'].strip()
        titles = [title.strip() for title in generated_text.split('\n') if title.strip()]
        
        return {
            'success': True,
            'generated_titles': titles[:5]  # Ensure max 5 titles
        }
    
    except Exception as e:
        return {
            'success': False,
            'error': f'Erro ao gerar títulos com OpenRouter: {str(e)}'
        }

def generate_script_chapters_with_openai(title, context, num_chapters, api_key):
    """Generate complete script with multiple chapters using OpenAI"""
    try:
        client = openai.OpenAI(api_key=api_key)
        
        # Base prompt for story generation
        base_prompt = f"""
        Você é um roteirista especializado em conteúdo viral para YouTube.
        
        Título: {title}
        Contexto: {context}
        
        Escreva uma história de aproximadamente 500 palavras que seja o primeiro capítulo desta narrativa. A história deve começar com uma versão sensacionalista do gancho baseada no título. Neste primeiro capítulo, exagere nos elementos curiosos e misteriosos para instigar e capturar a atenção do leitor desde o início. Descreva em detalhes vívidos e envolventes cada fato inusitado, criando uma atmosfera de expectativa e fascínio que mantenha o leitor ansioso para descobrir o que acontecerá a seguir.
        
        O tom da escrita deve ser simples, direto e emocional, como se a história estivesse sendo contada por um amigo em uma conversa informal. Use palavras fáceis, frases curtas e um ritmo leve, quase como fala. Evite palavras difíceis, estruturas complicadas ou linguagem literária. A narrativa deve prender a atenção com imagens claras, sentimentos universais e uma linguagem acessível. Termine o capítulo com um mistério ou dúvida, deixando o leitor curioso para saber o que vem a seguir.
        
        Regras importantes:
        1. Intensidade Emotiva - Cada frase deve transmitir emoção crua: medo, dor, choque, compaixão
        2. Urgência e Ritmo - Intercale frases curtas de ação com descrições sintéticas
        3. Sensação Cinematográfica - Altere o foco entre close-ups e planos gerais
        4. Narrador Observador e Próximo - Terceira pessoa com tom coloquial
        5. Linguagem de Choque - Termos impactantes relacionados a horror, tragédia e escândalo
        6. Proximidade com a Dor - Retrate de forma direta a dor física e emocional
        7. Consistência de Voz - Mantenha o mesmo timbre narrativo: informal, visceral, cinematográfico
        
        Forneça apenas o texto da história, sem explicações ou comentários adicionais.
        """
        
        # Generate first chapter
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Por favor, forneça o texto em Português, utilizando nomes e expressões comuns entre os falantes de Português em diferentes países, adaptado de forma a refletir a cultura compartilhada pelos diversos povos que falam a língua."},
                {"role": "user", "content": base_prompt}
            ],
            max_tokens=1000,
            temperature=0.8
        )
        
        chapters = []
        current_story = response.choices[0].message.content.strip()
        chapters.append({
            'chapter_number': 1,
            'content': current_story,
            'word_count': len(current_story.split())
        })
        
        # Generate subsequent chapters
        for i in range(2, num_chapters + 1):
            continuation_prompt = f"""
            {current_story}
            
            Escreva um novo capítulo, de aproximadamente 500 palavras, que continue os eventos descritos acima, introduzindo uma reviravolta extremamente chocante e impactante que transforme completamente a narrativa. Comece exatamente do ponto em que o capítulo anterior terminou, mas em algum momento, insira um evento dramático e inesperado que mude radicalmente o curso da história, alterando relacionamentos, revelando segredos devastadores ou transformando a verdadeira natureza de um personagem principal.
            
            Mantenha o mesmo estilo, linguagem e ritmo da narrativa original, enquanto constrói essa mudança abrupta de maneira que deixe o leitor em estado de choque. A reviravolta deve ser tão impactante que faça o leitor questionar tudo o que acreditava saber sobre a história até então.
            
            {"Se este for o último capítulo, encerre definitivamente a história, resolva os principais conflitos e conclua a trama de maneira satisfatória. Ao final, adicione uma mensagem urgente de CTA que EXIJA que o público se inscreva, curta, comente e compartilhe." if i == num_chapters else "Não finalize a trama nem resolva definitivamente os conflitos, mas use essa reviravolta para criar um gancho ainda mais poderoso ao final, deixando o leitor desesperado para descobrir as consequências desse evento transformador."}
            
            Forneça apenas o novo capítulo e não reescreva o capítulo anterior, sem explicações, comentários adicionais, contagem de palavras nem caracteres especiais.
            """
            
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "Por favor, forneça o texto em Português, utilizando nomes e expressões comuns entre os falantes de Português em diferentes países, adaptado de forma a refletir a cultura compartilhada pelos diversos povos que falam a língua."},
                    {"role": "user", "content": continuation_prompt}
                ],
                max_tokens=1000,
                temperature=0.8
            )
            
            new_chapter = response.choices[0].message.content.strip()
            chapters.append({
                'chapter_number': i,
                'content': new_chapter,
                'word_count': len(new_chapter.split())
            })
            
            # Update current story for next iteration
            current_story += "\n\n" + new_chapter
        
        # Calculate total statistics
        total_words = sum(chapter['word_count'] for chapter in chapters)
        
        return {
            'success': True,
            'chapters': chapters,
            'total_chapters': len(chapters),
            'total_words': total_words,
            'agent': 'ChatGPT',
            'title': title
        }
    
    except Exception as e:
        return {
            'success': False,
            'error': f'Erro ao gerar roteiro com ChatGPT: {str(e)}'
        }

def generate_script_chapters_with_claude(title, context, num_chapters, api_key):
    """Generate complete script with multiple chapters using Claude"""
    try:
        if not ANTHROPIC_AVAILABLE:
            return {
                'success': False,
                'error': 'Biblioteca anthropic não instalada. Execute: pip install anthropic'
            }
        
        client = anthropic.Anthropic(api_key=api_key)
        
        # Base prompt for story generation
        base_prompt = f"""
        Você é um roteirista especializado em conteúdo viral para YouTube.
        
        Título: {title}
        Contexto: {context}
        
        Escreva uma história de aproximadamente 500 palavras que seja o primeiro capítulo desta narrativa. A história deve começar com uma versão sensacionalista do gancho baseada no título. Neste primeiro capítulo, exagere nos elementos curiosos e misteriosos para instigar e capturar a atenção do leitor desde o início. Descreva em detalhes vívidos e envolventes cada fato inusitado, criando uma atmosfera de expectativa e fascínio que mantenha o leitor ansioso para descobrir o que acontecerá a seguir.
        
        O tom da escrita deve ser simples, direto e emocional, como se a história estivesse sendo contada por um amigo em uma conversa informal. Use palavras fáceis, frases curtas e um ritmo leve, quase como fala. Evite palavras difíceis, estruturas complicadas ou linguagem literária. A narrativa deve prender a atenção com imagens claras, sentimentos universais e uma linguagem acessível. Termine o capítulo com um mistério ou dúvida, deixando o leitor curioso para saber o que vem a seguir.
        
        Forneça apenas o texto da história, sem explicações ou comentários adicionais.
        """
        
        # Generate first chapter
        response = client.messages.create(
            model="claude-3-sonnet-20240229",
            max_tokens=1000,
            messages=[{"role": "user", "content": base_prompt}]
        )
        
        chapters = []
        current_story = response.content[0].text.strip()
        chapters.append({
            'chapter_number': 1,
            'content': current_story,
            'word_count': len(current_story.split())
        })
        
        # Generate subsequent chapters
        for i in range(2, num_chapters + 1):
            continuation_prompt = f"""
            {current_story}
            
            Escreva um novo capítulo, de aproximadamente 500 palavras, que continue os eventos descritos acima, introduzindo uma reviravolta extremamente chocante e impactante que transforme completamente a narrativa. Comece exatamente do ponto em que o capítulo anterior terminou, mas em algum momento, insira um evento dramático e inesperado que mude radicalmente o curso da história.
            
            {"Se este for o último capítulo, encerre definitivamente a história, resolva os principais conflitos e conclua a trama de maneira satisfatória. Ao final, adicione uma mensagem urgente de CTA que EXIJA que o público se inscreva, curta, comente e compartilhe." if i == num_chapters else "Não finalize a trama nem resolva definitivamente os conflitos, mas use essa reviravolta para criar um gancho ainda mais poderoso ao final."}
            
            Forneça apenas o novo capítulo, sem explicações ou comentários adicionais.
            """
            
            response = client.messages.create(
                model="claude-3-sonnet-20240229",
                max_tokens=1000,
                messages=[{"role": "user", "content": continuation_prompt}]
            )
            
            new_chapter = response.content[0].text.strip()
            chapters.append({
                'chapter_number': i,
                'content': new_chapter,
                'word_count': len(new_chapter.split())
            })
            
            # Update current story for next iteration
            current_story += "\n\n" + new_chapter
        
        # Calculate total statistics
        total_words = sum(chapter['word_count'] for chapter in chapters)
        
        return {
            'success': True,
            'chapters': chapters,
            'total_chapters': len(chapters),
            'total_words': total_words,
            'agent': 'Claude',
            'title': title
        }
    
    except Exception as e:
        return {
            'success': False,
            'error': f'Erro ao gerar roteiro com Claude: {str(e)}'
        }

def generate_script_chapters_with_gemini(title, context, num_chapters, api_key):
    """Generate complete script with multiple chapters using Gemini"""
    try:
        if not GEMINI_AVAILABLE:
            return {
                'success': False,
                'error': 'Biblioteca google-generativeai não instalada. Execute: pip install google-generativeai'
            }
        
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Base prompt for story generation
        base_prompt = f"""
        Você é um roteirista especializado em conteúdo viral para YouTube.
        
        Título: {title}
        Contexto: {context}
        
        Escreva uma história de aproximadamente 500 palavras que seja o primeiro capítulo desta narrativa. A história deve começar com uma versão sensacionalista do gancho baseada no título. Neste primeiro capítulo, exagere nos elementos curiosos e misteriosos para instigar e capturar a atenção do leitor desde o início. Descreva em detalhes vívidos e envolventes cada fato inusitado, criando uma atmosfera de expectativa e fascínio que mantenha o leitor ansioso para descobrir o que acontecerá a seguir.
        
        O tom da escrita deve ser simples, direto e emocional, como se a história estivesse sendo contada por um amigo em uma conversa informal. Use palavras fáceis, frases curtas e um ritmo leve, quase como fala. Evite palavras difíceis, estruturas complicadas ou linguagem literária. A narrativa deve prender a atenção com imagens claras, sentimentos universais e uma linguagem acessível. Termine o capítulo com um mistério ou dúvida, deixando o leitor curioso para saber o que vem a seguir.
        
        Forneça apenas o texto da história, sem explicações ou comentários adicionais.
        """
        
        # Generate first chapter
        response = model.generate_content(base_prompt)
        
        if not response.text:
            return {
                'success': False,
                'error': 'Gemini não retornou conteúdo. Verifique sua chave de API.'
            }
        
        chapters = []
        current_story = response.text.strip()
        chapters.append({
            'chapter_number': 1,
            'content': current_story,
            'word_count': len(current_story.split())
        })
        
        # Generate subsequent chapters
        for i in range(2, num_chapters + 1):
            continuation_prompt = f"""
            {current_story}
            
            Escreva um novo capítulo, de aproximadamente 500 palavras, que continue os eventos descritos acima, introduzindo uma reviravolta extremamente chocante e impactante que transforme completamente a narrativa. Comece exatamente do ponto em que o capítulo anterior terminou, mas em algum momento, insira um evento dramático e inesperado que mude radicalmente o curso da história.
            
            {"Se este for o último capítulo, encerre definitivamente a história, resolva os principais conflitos e conclua a trama de maneira satisfatória. Ao final, adicione uma mensagem urgente de CTA que EXIJA que o público se inscreva, curta, comente e compartilhe." if i == num_chapters else "Não finalize a trama nem resolva definitivamente os conflitos, mas use essa reviravolta para criar um gancho ainda mais poderoso ao final."}
            
            Forneça apenas o novo capítulo, sem explicações ou comentários adicionais.
            """
            
            response = model.generate_content(continuation_prompt)
            
            if not response.text:
                return {
                    'success': False,
                    'error': f'Gemini não retornou conteúdo para o capítulo {i}.'
                }
            
            new_chapter = response.text.strip()
            chapters.append({
                'chapter_number': i,
                'content': new_chapter,
                'word_count': len(new_chapter.split())
            })
            
            # Update current story for next iteration
            current_story += "\n\n" + new_chapter
        
        # Calculate total statistics
        total_words = sum(chapter['word_count'] for chapter in chapters)
        
        return {
            'success': True,
            'chapters': chapters,
            'total_chapters': len(chapters),
            'total_words': total_words,
            'agent': 'Gemini',
            'title': title
        }
    
    except Exception as e:
        return {
            'success': False,
            'error': f'Erro ao gerar roteiro com Gemini: {str(e)}'
        }

def generate_script_chapters_with_openrouter(title, context, num_chapters, api_key):
    """Generate complete script with multiple chapters using OpenRouter"""
    try:
        import requests
        
        # Base prompt for story generation
        base_prompt = f"""
        Você é um roteirista especializado em conteúdo viral para YouTube.
        
        Título: {title}
        Contexto: {context}
        
        Escreva uma história de aproximadamente 500 palavras que seja o primeiro capítulo desta narrativa. A história deve começar com uma versão sensacionalista do gancho baseada no título. Neste primeiro capítulo, exagere nos elementos curiosos e misteriosos para instigar e capturar a atenção do leitor desde o início. Descreva em detalhes vívidos e envolventes cada fato inusitado, criando uma atmosfera de expectativa e fascínio que mantenha o leitor ansioso para descobrir o que acontecerá a seguir.
        
        O tom da escrita deve ser simples, direto e emocional, como se a história estivesse sendo contada por um amigo em uma conversa informal. Use palavras fáceis, frases curtas e um ritmo leve, quase como fala. Evite palavras difíceis, estruturas complicadas ou linguagem literária. A narrativa deve prender a atenção com imagens claras, sentimentos universais e uma linguagem acessível. Termine o capítulo com um mistério ou dúvida, deixando o leitor curioso para saber o que vem a seguir.
        
        Forneça apenas o texto da história, sem explicações ou comentários adicionais.
        """
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        # Generate first chapter
        data = {
            "model": "anthropic/claude-3-sonnet",
            "messages": [{"role": "user", "content": base_prompt}],
            "max_tokens": 1000,
            "temperature": 0.8
        }
        
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=data,
            timeout=60
        )
        
        if response.status_code != 200:
            raise Exception(f"OpenRouter API error: {response.status_code}")
        
        result = response.json()
        chapters = []
        current_story = result['choices'][0]['message']['content'].strip()
        chapters.append({
            'chapter_number': 1,
            'content': current_story,
            'word_count': len(current_story.split())
        })
        
        # Generate subsequent chapters
        for i in range(2, num_chapters + 1):
            continuation_prompt = f"""
            {current_story}
            
            Escreva um novo capítulo, de aproximadamente 500 palavras, que continue os eventos descritos acima, introduzindo uma reviravolta extremamente chocante e impactante que transforme completamente a narrativa. Comece exatamente do ponto em que o capítulo anterior terminou, mas em algum momento, insira um evento dramático e inesperado que mude radicalmente o curso da história.
            
            {"Se este for o último capítulo, encerre definitivamente a história, resolva os principais conflitos e conclua a trama de maneira satisfatória. Ao final, adicione uma mensagem urgente de CTA que EXIJA que o público se inscreva, curta, comente e compartilhe." if i == num_chapters else "Não finalize a trama nem resolva definitivamente os conflitos, mas use essa reviravolta para criar um gancho ainda mais poderoso ao final."}
            
            Forneça apenas o novo capítulo, sem explicações ou comentários adicionais.
            """
            
            data = {
                "model": "anthropic/claude-3-sonnet",
                "messages": [{"role": "user", "content": continuation_prompt}],
                "max_tokens": 1000,
                "temperature": 0.8
            }
            
            response = requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers=headers,
                json=data,
                timeout=60
            )
            
            if response.status_code != 200:
                raise Exception(f"OpenRouter API error: {response.status_code}")
            
            result = response.json()
            new_chapter = result['choices'][0]['message']['content'].strip()
            chapters.append({
                'chapter_number': i,
                'content': new_chapter,
                'word_count': len(new_chapter.split())
            })
            
            # Update current story for next iteration
            current_story += "\n\n" + new_chapter
        
        # Calculate total statistics
        total_words = sum(chapter['word_count'] for chapter in chapters)
        
        return {
            'success': True,
            'chapters': chapters,
            'total_chapters': len(chapters),
            'total_words': total_words,
            'agent': 'OpenRouter',
            'title': title
        }

    except Exception as e:
        return {
            'success': False,
            'error': f'Erro ao gerar roteiro com OpenRouter: {str(e)}'
        }

# Functions for generating premises with different AI agents

def generate_premise_with_openai(title, resume, agent_prompt, api_key):
    """Generate premise using OpenAI ChatGPT"""
    try:
        import openai

        client = openai.OpenAI(api_key=api_key)

        # Build the prompt with title and resume
        full_prompt = f"""{agent_prompt}

Título: '{title}'
Resumo: '{resume}'"""

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": full_prompt}],
            max_tokens=1000,
            temperature=0.8
        )

        generated_premise = response.choices[0].message.content.strip()

        return {
            'success': True,
            'premise': generated_premise,
            'agent': 'ChatGPT'
        }

    except Exception as e:
        return {
            'success': False,
            'error': f'Erro ao gerar premissa com ChatGPT: {str(e)}'
        }

def generate_premise_with_claude(title, resume, agent_prompt, api_key):
    """Generate premise using Anthropic Claude"""
    try:
        if not ANTHROPIC_AVAILABLE:
            return {
                'success': False,
                'error': 'Biblioteca anthropic não instalada. Execute: pip install anthropic'
            }

        import anthropic

        client = anthropic.Anthropic(api_key=api_key)

        # Build the prompt with title and resume
        full_prompt = f"""{agent_prompt}

Título: '{title}'
Resumo: '{resume}'"""

        response = client.messages.create(
            model="claude-3-sonnet-20240229",
            max_tokens=1000,
            temperature=0.8,
            messages=[{"role": "user", "content": full_prompt}]
        )

        generated_premise = response.content[0].text.strip()

        return {
            'success': True,
            'premise': generated_premise,
            'agent': 'Claude'
        }

    except Exception as e:
        return {
            'success': False,
            'error': f'Erro ao gerar premissa com Claude: {str(e)}'
        }

def generate_premise_with_gemini(title, resume, agent_prompt, api_key):
    """Generate premise using Google Gemini"""
    try:
        if not GEMINI_AVAILABLE:
            return {
                'success': False,
                'error': 'Biblioteca google-generativeai não instalada. Execute: pip install google-generativeai'
            }

        import google.generativeai as genai

        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')

        # Build the prompt with title and resume
        full_prompt = f"""{agent_prompt}

Título: '{title}'
Resumo: '{resume}'"""

        response = model.generate_content(full_prompt)

        if not response.text:
            return {
                'success': False,
                'error': 'Gemini não retornou conteúdo. Verifique sua chave de API.'
            }

        generated_premise = response.text.strip()

        return {
            'success': True,
            'premise': generated_premise,
            'agent': 'Gemini'
        }

    except Exception as e:
        return {
            'success': False,
            'error': f'Erro ao gerar premissa com Gemini: {str(e)}'
        }

def generate_premise_with_openrouter(title, resume, agent_prompt, api_key):
    """Generate premise using OpenRouter"""
    try:
        import requests

        # Build the prompt with title and resume
        full_prompt = f"""{agent_prompt}

Título: '{title}'
Resumo: '{resume}'"""

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

        data = {
            "model": "anthropic/claude-3-sonnet",
            "messages": [{"role": "user", "content": full_prompt}],
            "max_tokens": 1000,
            "temperature": 0.8
        }

        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=data,
            timeout=60
        )

        if response.status_code != 200:
            raise Exception(f"OpenRouter API error: {response.status_code}")

        result = response.json()
        generated_premise = result['choices'][0]['message']['content'].strip()

        return {
            'success': True,
            'premise': generated_premise,
            'agent': 'OpenRouter'
        }

    except Exception as e:
        return {
            'success': False,
            'error': f'Erro ao gerar premissa com OpenRouter: {str(e)}'
        }

@content_processor_bp.route('/audio/voices', methods=['POST'])
def get_available_voices():
    """Get available voices for a TTS service"""
    try:
        data = request.get_json()
        service = data.get('service', '').lower()
        api_key = data.get('api_key', '').strip()

        print(f"DEBUG: Get voices request - Service: {service}")

        if not api_key and service not in ['edge', 'coqui', 'kokoro', 'chatterbox']:
            return jsonify({
                'success': False,
                'error': f'Chave da API {service.upper()} é obrigatória'
            }), 400

        # Get voices based on the selected service
        if service == 'gemini':
            result = get_gemini_tts_voices(api_key)
        elif service == 'chatterbox':
            result = get_chatterbox_voices()
        elif service == 'elevenlabs':
            result = get_elevenlabs_voices(api_key)
        elif service == 'openai':
            result = get_openai_voices(api_key)
        elif service == 'azure':
            result = get_azure_voices(api_key)
        elif service == 'aws':
            result = get_aws_voices(api_key)
        elif service == 'google':
            result = get_google_voices(api_key)
        elif service == 'edge':
            result = get_edge_voices()
        elif service == 'coqui':
            result = get_coqui_voices()
        elif service == 'kokoro':
            result = get_kokoro_voices()
        else:
            return jsonify({
                'success': False,
                'error': f'Serviço {service} não suportado'
            }), 400

        return jsonify(result)

    except Exception as e:
        print(f"DEBUG: Exception in get_available_voices: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': f'Erro interno: {str(e)}'
        }), 500

@content_processor_bp.route('/generate-audio', methods=['POST'])
def generate_audio_with_ai():
    """Generate audio using different TTS services"""
    try:
        data = request.get_json()
        service = data.get('service', '').lower()
        api_key = data.get('api_key', '').strip()
        text = data.get('text', '').strip()
        voice_id = data.get('voice_id', '')
        settings = data.get('settings', {})

        print(f"DEBUG: Generate audio request - Service: {service}, Text length: {len(text)}")

        if not api_key and service not in ['edge', 'coqui', 'kokoro', 'chatterbox']:
            return jsonify({
                'success': False,
                'error': f'Chave da API {service.upper()} é obrigatória'
            }), 400

        if not text:
            return jsonify({
                'success': False,
                'error': 'Texto é obrigatório'
            }), 400

        # Generate audio based on the selected service
        if service == 'gemini':
            result = generate_audio_gemini(text, voice_id, settings, api_key)
        elif service == 'chatterbox':
            result = generate_audio_chatterbox(text, voice_id, settings)
        elif service == 'elevenlabs':
            result = generate_audio_elevenlabs(text, voice_id, settings, api_key)
        elif service == 'openai':
            result = generate_audio_openai(text, voice_id, settings, api_key)
        elif service == 'azure':
            result = generate_audio_azure(text, voice_id, settings, api_key)
        elif service == 'aws':
            result = generate_audio_aws(text, voice_id, settings, api_key)
        elif service == 'google':
            result = generate_audio_google(text, voice_id, settings, api_key)
        elif service == 'edge':
            result = generate_audio_edge(text, voice_id, settings)
        elif service == 'coqui':
            result = generate_audio_coqui(text, voice_id, settings)
        elif service == 'kokoro':
            result = generate_audio_kokoro(text, voice_id, settings)
        else:
            return jsonify({
                'success': False,
                'error': f'Serviço {service} não suportado'
            }), 400

        return jsonify(result)

    except Exception as e:
        print(f"DEBUG: Exception in generate_audio_with_ai: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': f'Erro interno: {str(e)}'
        }), 500

@content_processor_bp.route('/join-audio-segments', methods=['POST'])
def join_audio_segments():
    """Join multiple audio segments into a single file"""
    try:
        data = request.get_json()
        segments = data.get('segments', [])

        print(f"DEBUG: Join audio segments request - {len(segments)} segments")

        if not segments:
            return jsonify({
                'success': False,
                'error': 'Nenhum segmento fornecido para juntar'
            }), 400

        # Try to use pydub for audio joining
        try:
            from pydub import AudioSegment

            # Load first segment
            combined = AudioSegment.from_file(segments[0].replace('/static/audio/',
                os.path.join(os.path.dirname(__file__), '..', 'static', 'audio', '')))

            # Add remaining segments
            for segment_url in segments[1:]:
                segment_path = segment_url.replace('/static/audio/',
                    os.path.join(os.path.dirname(__file__), '..', 'static', 'audio', ''))
                segment_audio = AudioSegment.from_file(segment_path)
                combined += segment_audio

            # Save combined audio
            output_filename = f"audio_combined_{int(time.time())}.mp3"
            output_path = os.path.join(os.path.dirname(__file__), '..', 'static', 'audio', output_filename)

            combined.export(output_path, format="mp3")

            # Calculate duration
            duration_seconds = len(combined) / 1000
            duration_minutes = int(duration_seconds // 60)
            duration_secs = int(duration_seconds % 60)
            duration_str = f"{duration_minutes}:{duration_secs:02d}"

            return jsonify({
                'success': True,
                'audio_url': f'/static/audio/{output_filename}',
                'duration': duration_str,
                'segments_joined': len(segments)
            })

        except ImportError:
            # Fallback: simple concatenation (less ideal but works)
            output_filename = f"audio_combined_{int(time.time())}.mp3"
            output_path = os.path.join(os.path.dirname(__file__), '..', 'static', 'audio', output_filename)

            with open(output_path, 'wb') as outfile:
                for segment_url in segments:
                    segment_path = segment_url.replace('/static/audio/',
                        os.path.join(os.path.dirname(__file__), '..', 'static', 'audio', ''))
                    with open(segment_path, 'rb') as infile:
                        outfile.write(infile.read())

            return jsonify({
                'success': True,
                'audio_url': f'/static/audio/{output_filename}',
                'duration': f'~{len(segments) * 10} min',  # Estimate
                'segments_joined': len(segments),
                'note': 'Áudio juntado usando concatenação simples. Para melhor qualidade, instale pydub.'
            })

    except Exception as e:
        print(f"DEBUG: Exception in join_audio_segments: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': f'Erro interno: {str(e)}'
        }), 500

# Functions for getting voices from different TTS services

def get_gemini_tts_voices(api_key):
    """Get available voices from Google Gemini TTS"""
    try:
        # Gemini TTS has predefined voices
        voices = [
            {'id': 'Puck', 'name': 'Puck (Masculina)', 'gender': 'Male'},
            {'id': 'Charon', 'name': 'Charon (Masculina)', 'gender': 'Male'},
            {'id': 'Kore', 'name': 'Kore (Feminina)', 'gender': 'Female'},
            {'id': 'Fenrir', 'name': 'Fenrir (Masculina)', 'gender': 'Male'},
            {'id': 'Aoede', 'name': 'Aoede (Feminina)', 'gender': 'Female'}
        ]

        return {
            'success': True,
            'voices': voices
        }

    except Exception as e:
        return {
            'success': False,
            'error': f'Erro ao carregar vozes Gemini TTS: {str(e)}'
        }

def get_chatterbox_voices():
    """Get available voices from Chatterbox TTS"""
    try:
        # Chatterbox supports voice cloning with reference audio
        # For now, we'll provide some default options
        voices = [
            {'id': 'default', 'name': 'Voz Padrão (Neutro)', 'gender': 'Neutral'},
            {'id': 'expressive', 'name': 'Voz Expressiva (Dinâmica)', 'gender': 'Neutral'},
            {'id': 'calm', 'name': 'Voz Calma (Suave)', 'gender': 'Neutral'},
            {'id': 'energetic', 'name': 'Voz Energética (Animada)', 'gender': 'Neutral'}
        ]

        return {
            'success': True,
            'voices': voices
        }

    except Exception as e:
        return {
            'success': False,
            'error': f'Erro ao carregar vozes Chatterbox: {str(e)}'
        }

def get_elevenlabs_voices(api_key):
    """Get available voices from ElevenLabs"""
    try:
        import requests

        headers = {
            "Accept": "application/json",
            "xi-api-key": api_key
        }

        response = requests.get("https://api.elevenlabs.io/v1/voices", headers=headers)

        if response.status_code != 200:
            return {
                'success': False,
                'error': f'Erro na API ElevenLabs: {response.status_code}'
            }

        data = response.json()
        voices = []

        for voice in data.get('voices', []):
            voices.append({
                'id': voice['voice_id'],
                'name': voice['name'],
                'gender': voice.get('labels', {}).get('gender', 'Unknown'),
                'description': voice.get('description', ''),
                'preview_url': voice.get('preview_url', '')
            })

        return {
            'success': True,
            'voices': voices
        }

    except Exception as e:
        return {
            'success': False,
            'error': f'Erro ao carregar vozes ElevenLabs: {str(e)}'
        }

def get_openai_voices(api_key):
    """Get available voices from OpenAI TTS"""
    try:
        # OpenAI TTS has predefined voices
        voices = [
            {'id': 'alloy', 'name': 'Alloy', 'gender': 'Neutral'},
            {'id': 'echo', 'name': 'Echo', 'gender': 'Male'},
            {'id': 'fable', 'name': 'Fable', 'gender': 'Female'},
            {'id': 'onyx', 'name': 'Onyx', 'gender': 'Male'},
            {'id': 'nova', 'name': 'Nova', 'gender': 'Female'},
            {'id': 'shimmer', 'name': 'Shimmer', 'gender': 'Female'}
        ]

        return {
            'success': True,
            'voices': voices
        }

    except Exception as e:
        return {
            'success': False,
            'error': f'Erro ao carregar vozes OpenAI: {str(e)}'
        }

def get_azure_voices(api_key):
    """Get available voices from Azure Speech"""
    try:
        # Simplified list of popular Azure voices
        voices = [
            {'id': 'pt-BR-AntonioNeural', 'name': 'Antonio (Português BR)', 'gender': 'Male'},
            {'id': 'pt-BR-FranciscaNeural', 'name': 'Francisca (Português BR)', 'gender': 'Female'},
            {'id': 'en-US-JennyNeural', 'name': 'Jenny (English US)', 'gender': 'Female'},
            {'id': 'en-US-GuyNeural', 'name': 'Guy (English US)', 'gender': 'Male'},
            {'id': 'es-ES-ElviraNeural', 'name': 'Elvira (Español)', 'gender': 'Female'},
        ]

        return {
            'success': True,
            'voices': voices
        }

    except Exception as e:
        return {
            'success': False,
            'error': f'Erro ao carregar vozes Azure: {str(e)}'
        }

def get_aws_voices(api_key):
    """Get available voices from AWS Polly"""
    try:
        # Simplified list of popular AWS Polly voices
        voices = [
            {'id': 'Camila', 'name': 'Camila (Português BR)', 'gender': 'Female'},
            {'id': 'Ricardo', 'name': 'Ricardo (Português BR)', 'gender': 'Male'},
            {'id': 'Joanna', 'name': 'Joanna (English US)', 'gender': 'Female'},
            {'id': 'Matthew', 'name': 'Matthew (English US)', 'gender': 'Male'},
            {'id': 'Lucia', 'name': 'Lucia (Español)', 'gender': 'Female'},
        ]

        return {
            'success': True,
            'voices': voices
        }

    except Exception as e:
        return {
            'success': False,
            'error': f'Erro ao carregar vozes AWS: {str(e)}'
        }

def get_google_voices(api_key):
    """Get available voices from Google Text-to-Speech"""
    try:
        # Simplified list of popular Google voices
        voices = [
            {'id': 'pt-BR-Standard-A', 'name': 'Português BR - Feminina A', 'gender': 'Female'},
            {'id': 'pt-BR-Standard-B', 'name': 'Português BR - Masculina B', 'gender': 'Male'},
            {'id': 'en-US-Standard-C', 'name': 'English US - Feminina C', 'gender': 'Female'},
            {'id': 'en-US-Standard-D', 'name': 'English US - Masculina D', 'gender': 'Male'},
            {'id': 'es-ES-Standard-A', 'name': 'Español - Feminina A', 'gender': 'Female'},
        ]

        return {
            'success': True,
            'voices': voices
        }

    except Exception as e:
        return {
            'success': False,
            'error': f'Erro ao carregar vozes Google: {str(e)}'
        }

def get_edge_voices():
    """Get available voices from Microsoft Edge TTS (Free)"""
    try:
        voices = [
            {'id': 'pt-BR-AntonioNeural', 'name': 'Antonio (Português BR)', 'gender': 'Male'},
            {'id': 'pt-BR-FranciscaNeural', 'name': 'Francisca (Português BR)', 'gender': 'Female'},
            {'id': 'en-US-AriaNeural', 'name': 'Aria (English US)', 'gender': 'Female'},
            {'id': 'en-US-GuyNeural', 'name': 'Guy (English US)', 'gender': 'Male'},
        ]

        return {
            'success': True,
            'voices': voices
        }

    except Exception as e:
        return {
            'success': False,
            'error': f'Erro ao carregar vozes Edge: {str(e)}'
        }

def get_coqui_voices():
    """Get available voices from Coqui TTS (Local/Free)"""
    try:
        voices = [
            {'id': 'tts_models/pt/cv/vits', 'name': 'Português - VITS', 'gender': 'Neutral'},
            {'id': 'tts_models/en/ljspeech/tacotron2-DDC', 'name': 'English - Tacotron2', 'gender': 'Female'},
            {'id': 'tts_models/en/ljspeech/glow-tts', 'name': 'English - Glow-TTS', 'gender': 'Female'},
        ]

        return {
            'success': True,
            'voices': voices
        }

    except Exception as e:
        return {
            'success': False,
            'error': f'Erro ao carregar vozes Coqui: {str(e)}'
        }

def get_kokoro_voices():
    """Get available voices from Kokoro TTS (Free)"""
    try:
        # Kokoro TTS principais idiomas com foco em português
        voices = [
            {'id': 'pt', 'name': 'Português (Recomendado)', 'gender': 'Neutral'},
            {'id': 'en', 'name': 'English', 'gender': 'Neutral'},
            {'id': 'es', 'name': 'Español', 'gender': 'Neutral'},
            {'id': 'fr', 'name': 'Français', 'gender': 'Neutral'},
            {'id': 'de', 'name': 'Deutsch', 'gender': 'Neutral'},
            {'id': 'it', 'name': 'Italiano', 'gender': 'Neutral'},
            {'id': 'ja', 'name': 'Japanese', 'gender': 'Neutral'},
            {'id': 'ko', 'name': 'Korean', 'gender': 'Neutral'},
            {'id': 'zh', 'name': 'Chinese', 'gender': 'Neutral'},
            {'id': 'ru', 'name': 'Russian', 'gender': 'Neutral'},
            {'id': 'ar', 'name': 'Arabic', 'gender': 'Neutral'},
            {'id': 'hi', 'name': 'Hindi', 'gender': 'Neutral'}
        ]

        return {
            'success': True,
            'voices': voices
        }

    except Exception as e:
        return {
            'success': False,
            'error': f'Erro ao carregar vozes Kokoro: {str(e)}'
        }

# Functions for generating audio with different TTS services

def generate_audio_chatterbox(text, voice_id, settings):
    """Generate audio using Chatterbox TTS with memory optimizations"""
    try:
        # Check if chatterbox is available
        try:
            import torch
            import torchaudio as ta
            from chatterbox import ChatterboxTTS
            import gc
            import os
        except ImportError as e:
            print(f"DEBUG: Chatterbox import error: {e}")
            return {
                'success': False,
                'error': 'Chatterbox TTS não instalado. Execute: pip install chatterbox-tts'
            }

        print(f"DEBUG: Initializing Chatterbox TTS with memory optimizations...")

        # Memory optimization settings
        torch.set_num_threads(2)  # Limit CPU threads
        if torch.cuda.is_available():
            torch.cuda.empty_cache()

        # Force garbage collection before loading model
        gc.collect()

        # Set environment variables for memory optimization
        os.environ['PYTORCH_CUDA_ALLOC_CONF'] = 'max_split_size_mb:128'

        # Initialize model (this might take some time on first run)
        try:
            print(f"DEBUG: Loading Chatterbox model with reduced memory footprint...")

            # Try loading with memory optimizations
            model = ChatterboxTTS.from_pretrained(
                device="cpu",
                torch_dtype=torch.float32,  # Use float32 for better CPU compatibility
            )

            print(f"DEBUG: Chatterbox model loaded successfully!")

        except Exception as e:
            print(f"DEBUG: Error loading Chatterbox model: {e}")

            # If memory error, suggest solutions
            if "paging file" in str(e).lower() or "memory" in str(e).lower():
                return {
                    'success': False,
                    'error': f'Erro de memória ao carregar Chatterbox. Tente: 1) Reiniciar o sistema, 2) Fechar outros programas, 3) Aumentar memória virtual. Erro: {str(e)}'
                }
            else:
                return {
                    'success': False,
                    'error': f'Erro ao carregar modelo Chatterbox: {str(e)}'
                }

        print(f"DEBUG: Generating audio with Chatterbox...")
        print(f"DEBUG: Voice: {voice_id or 'default'}, Text length: {len(text)}")

        # Limit text length to avoid memory issues
        max_length = 300  # Reduced from 500 to save more memory
        if len(text) > max_length:
            text = text[:max_length] + "..."
            print(f"DEBUG: Text truncated to {max_length} characters to save memory")

        # Configure generation parameters based on voice_id
        exaggeration = 0.5
        cfg_weight = 0.5

        if voice_id == 'expressive':
            exaggeration = 0.7
            cfg_weight = 0.3
        elif voice_id == 'calm':
            exaggeration = 0.3
            cfg_weight = 0.7
        elif voice_id == 'energetic':
            exaggeration = 0.8
            cfg_weight = 0.3

        # Generate audio with memory management
        try:
            with torch.no_grad():  # Disable gradient computation to save memory
                wav = model.generate(
                    text,
                    exaggeration=exaggeration,
                    cfg_weight=cfg_weight
                )

            # Force cleanup after generation
            gc.collect()

        except Exception as e:
            print(f"DEBUG: Audio generation failed: {e}")

            # Clean up model and try again with minimal settings
            try:
                del model
                gc.collect()

                # Reload model and try with minimal parameters
                model = ChatterboxTTS.from_pretrained(device="cpu")
                with torch.no_grad():
                    wav = model.generate(text[:200])  # Even shorter text

            except Exception as e2:
                print(f"DEBUG: Retry also failed: {e2}")
                return {
                    'success': False,
                    'error': f'Erro na geração de áudio. Memória insuficiente. Tente reiniciar o sistema. Erro: {str(e)}'
                }

        # Save audio file
        audio_filename = f"audio_chatterbox_{int(time.time())}.wav"
        audio_path = os.path.join(os.path.dirname(__file__), '..', 'static', 'audio', audio_filename)

        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(audio_path), exist_ok=True)

        # Save the audio
        ta.save(audio_path, wav, model.sr)

        print(f"DEBUG: Chatterbox audio saved: {audio_path}")

        # Calculate duration
        try:
            import wave
            with wave.open(audio_path, 'rb') as wav_file:
                frames = wav_file.getnframes()
                sample_rate = wav_file.getframerate()
                duration_seconds = frames / sample_rate
                duration_str = f"{int(duration_seconds // 60)}:{int(duration_seconds % 60):02d}"
                print(f"DEBUG: Chatterbox audio duration: {duration_str}")
        except Exception as e:
            print(f"DEBUG: Could not get duration: {e}")
            duration_str = f'{len(text) // 150} min'

        # Final cleanup
        try:
            del model
            del wav
            gc.collect()
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
        except:
            pass

        return {
            'success': True,
            'audio_url': f'/static/audio/{audio_filename}',
            'duration': duration_str,
            'service': 'chatterbox'
        }

    except Exception as e:
        print(f"DEBUG: Chatterbox generation error: {e}")

        # Force cleanup on error
        try:
            gc.collect()
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
        except:
            pass

        return {
            'success': False,
            'error': f'Erro ao gerar áudio com Chatterbox: {str(e)}'
        }

def generate_audio_gemini(text, voice_id, settings, api_key):
    """Generate audio using Google Gemini TTS"""
    try:
        if not GEMINI_AVAILABLE:
            return {
                'success': False,
                'error': 'Biblioteca google-generativeai não instalada. Execute: pip install google-generativeai'
            }

        import google.generativeai as genai
        import requests
        import base64

        # Configure Gemini
        genai.configure(api_key=api_key)

        # Use REST API approach for TTS since the new SDK might not be available
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent"

        headers = {
            "x-goog-api-key": api_key,
            "Content-Type": "application/json"
        }

        data = {
            "contents": [{
                "parts": [{
                    "text": text
                }]
            }],
            "generationConfig": {
                "responseModalities": ["AUDIO"],
                "speechConfig": {
                    "voiceConfig": {
                        "prebuiltVoiceConfig": {
                            "voiceName": voice_id or "Puck"
                        }
                    }
                }
            }
        }

        print(f"DEBUG: Sending request to Gemini TTS API...")
        response = requests.post(url, headers=headers, json=data, timeout=60)

        print(f"DEBUG: Gemini TTS Response Status: {response.status_code}")

        if response.status_code != 200:
            print(f"DEBUG: Gemini TTS Error Response: {response.text}")
            return {
                'success': False,
                'error': f'Erro na API Gemini TTS: {response.status_code} - {response.text}'
            }

        result = response.json()
        print(f"DEBUG: Gemini TTS Response Keys: {list(result.keys())}")

        if not result.get('candidates') or not result['candidates'][0].get('content', {}).get('parts'):
            print(f"DEBUG: Invalid response structure: {result}")
            return {
                'success': False,
                'error': 'Gemini TTS não retornou áudio. Verifique sua chave de API.'
            }

        # Get audio data (base64 encoded)
        audio_data_b64 = result['candidates'][0]['content']['parts'][0]['inlineData']['data']
        audio_data = base64.b64decode(audio_data_b64)

        print(f"DEBUG: Audio data size: {len(audio_data)} bytes")

        # Save audio file
        audio_filename = f"audio_gemini_{int(time.time())}.wav"
        audio_path = os.path.join(os.path.dirname(__file__), '..', 'static', 'audio', audio_filename)

        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(audio_path), exist_ok=True)

        # Write audio data
        with open(audio_path, 'wb') as f:
            f.write(audio_data)

        print(f"DEBUG: Audio file saved: {audio_path}")

        # Try to get actual duration using wave library
        try:
            import wave
            with wave.open(audio_path, 'rb') as wav_file:
                frames = wav_file.getnframes()
                sample_rate = wav_file.getframerate()
                duration_seconds = frames / sample_rate
                duration_str = f"{int(duration_seconds // 60)}:{int(duration_seconds % 60):02d}"
                print(f"DEBUG: Actual audio duration: {duration_str}")
        except Exception as e:
            print(f"DEBUG: Could not get duration: {e}")
            duration_str = f'{len(text) // 150} min'

        return {
            'success': True,
            'audio_url': f'/static/audio/{audio_filename}',
            'duration': duration_str,
            'service': 'gemini'
        }

    except Exception as e:
        return {
            'success': False,
            'error': f'Erro ao gerar áudio com Gemini TTS: {str(e)}'
        }

def generate_audio_elevenlabs(text, voice_id, settings, api_key):
    """Generate audio using ElevenLabs"""
    try:
        import requests
        import base64
        import os

        url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"

        headers = {
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": api_key
        }

        data = {
            "text": text,
            "model_id": "eleven_monolingual_v1",
            "voice_settings": {
                "stability": settings.get('stability', 0.5),
                "similarity_boost": settings.get('clarity', 0.75),
                "style": 0.0,
                "use_speaker_boost": True
            }
        }

        response = requests.post(url, json=data, headers=headers)

        if response.status_code != 200:
            return {
                'success': False,
                'error': f'Erro na API ElevenLabs: {response.status_code}'
            }

        # Save audio file
        audio_filename = f"audio_{int(time.time())}.mp3"
        audio_path = os.path.join(os.path.dirname(__file__), '..', 'static', 'audio', audio_filename)

        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(audio_path), exist_ok=True)

        with open(audio_path, 'wb') as f:
            f.write(response.content)

        return {
            'success': True,
            'audio_url': f'/static/audio/{audio_filename}',
            'duration': f'{len(text) // 150} min',  # Rough estimate
            'service': 'elevenlabs'
        }

    except Exception as e:
        return {
            'success': False,
            'error': f'Erro ao gerar áudio com ElevenLabs: {str(e)}'
        }

def generate_audio_openai(text, voice_id, settings, api_key):
    """Generate audio using OpenAI TTS"""
    try:
        # Check if openai is available
        try:
            import openai
        except ImportError:
            return {
                'success': False,
                'error': 'OpenAI não instalado. Execute: pip install openai'
            }

        print(f"DEBUG: Initializing OpenAI TTS...")

        try:
            client = openai.OpenAI(api_key=api_key)
        except Exception as e:
            return {
                'success': False,
                'error': f'Erro ao configurar cliente OpenAI: {str(e)}'
            }

        print(f"DEBUG: Generating audio with OpenAI TTS...")
        print(f"DEBUG: Voice: {voice_id or 'alloy'}, Speed: {settings.get('speed', 1.0)}")

        # Choose model based on quality preference
        model = "tts-1-hd" if settings.get('quality', 'standard') == 'hd' else "tts-1"

        response = client.audio.speech.create(
            model=model,
            voice=voice_id or "alloy",
            input=text,
            speed=settings.get('speed', 1.0)
        )

        # Save audio file
        audio_filename = f"audio_openai_{int(time.time())}.mp3"
        audio_path = os.path.join(os.path.dirname(__file__), '..', 'static', 'audio', audio_filename)

        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(audio_path), exist_ok=True)

        response.stream_to_file(audio_path)

        print(f"DEBUG: OpenAI audio saved: {audio_path}")

        # Calculate duration (rough estimate for MP3)
        try:
            # For MP3 files, we'll use a rough estimate based on text length
            # OpenAI TTS typically produces about 150-200 characters per minute
            chars_per_minute = 175
            duration_seconds = (len(text) / chars_per_minute) * 60
            duration_str = f"{int(duration_seconds // 60)}:{int(duration_seconds % 60):02d}"
            print(f"DEBUG: Estimated OpenAI audio duration: {duration_str}")
        except Exception as e:
            print(f"DEBUG: Could not estimate duration: {e}")
            duration_str = f'{len(text) // 150} min'

        return {
            'success': True,
            'audio_url': f'/static/audio/{audio_filename}',
            'duration': duration_str,
            'service': 'openai'
        }

    except Exception as e:
        print(f"DEBUG: OpenAI generation error: {e}")
        return {
            'success': False,
            'error': f'Erro ao gerar áudio com OpenAI: {str(e)}'
        }

def generate_audio_azure(text, voice_id, settings, api_key):
    """Generate audio using Azure Speech"""
    try:
        # Placeholder implementation - would need Azure Speech SDK
        return {
            'success': False,
            'error': 'Azure Speech não implementado ainda. Use ElevenLabs ou OpenAI.'
        }

    except Exception as e:
        return {
            'success': False,
            'error': f'Erro ao gerar áudio com Azure: {str(e)}'
        }

def generate_audio_aws(text, voice_id, settings, api_key):
    """Generate audio using AWS Polly"""
    try:
        # Placeholder implementation - would need boto3
        return {
            'success': False,
            'error': 'AWS Polly não implementado ainda. Use ElevenLabs ou OpenAI.'
        }

    except Exception as e:
        return {
            'success': False,
            'error': f'Erro ao gerar áudio com AWS: {str(e)}'
        }

def generate_audio_google(text, voice_id, settings, api_key):
    """Generate audio using Google Text-to-Speech"""
    try:
        # Placeholder implementation - would need Google Cloud TTS
        return {
            'success': False,
            'error': 'Google TTS não implementado ainda. Use ElevenLabs ou OpenAI.'
        }

    except Exception as e:
        return {
            'success': False,
            'error': f'Erro ao gerar áudio com Google: {str(e)}'
        }

def generate_audio_edge(text, voice_id, settings):
    """Generate audio using Microsoft Edge TTS (Free)"""
    try:
        # Placeholder implementation - would need edge-tts library
        return {
            'success': False,
            'error': 'Edge TTS não implementado ainda. Use ElevenLabs ou OpenAI.'
        }

    except Exception as e:
        return {
            'success': False,
            'error': f'Erro ao gerar áudio com Edge: {str(e)}'
        }

def generate_audio_coqui(text, voice_id, settings):
    """Generate audio using Coqui TTS (Local)"""
    try:
        # Placeholder implementation - would need TTS library
        return {
            'success': False,
            'error': 'Coqui TTS não implementado ainda. Use ElevenLabs ou OpenAI.'
        }

    except Exception as e:
        return {
            'success': False,
            'error': f'Erro ao gerar áudio com Coqui: {str(e)}'
        }

def generate_audio_kokoro(text, voice_id, settings):
    """Generate audio using Kokoro TTS"""
    try:
        # Check if kokoro is available
        try:
            import sys
            print(f"DEBUG: Python executable: {sys.executable}")
            print(f"DEBUG: Python path: {sys.path[:3]}")

            from kokoro_onnx import Kokoro
            import soundfile as sf
            import numpy as np
            print(f"DEBUG: Kokoro imported successfully!")
        except ImportError as e:
            print(f"DEBUG: Kokoro import error: {e}")
            print(f"DEBUG: Python executable: {sys.executable}")
            return {
                'success': False,
                'error': f'Kokoro TTS não instalado. Erro: {str(e)}'
            }

        print(f"DEBUG: Initializing Kokoro TTS...")

        # Initialize model
        try:
            model = Kokoro()
        except Exception as e:
            print(f"DEBUG: Error loading Kokoro model: {e}")
            return {
                'success': False,
                'error': f'Erro ao carregar modelo Kokoro: {str(e)}'
            }

        print(f"DEBUG: Generating audio with Kokoro...")

        # Use Portuguese as default if voice_id is 'pt' or not specified
        language = voice_id if voice_id and voice_id != 'pt' else 'pt'

        # Generate audio
        try:
            audio = model.create(text, lang=language)
        except Exception as e:
            print(f"DEBUG: Error generating audio: {e}")
            # Fallback to English if language not supported
            try:
                audio = model.create(text, lang='en')
                print(f"DEBUG: Fallback to English successful")
            except Exception as e2:
                return {
                    'success': False,
                    'error': f'Erro ao gerar áudio: {str(e2)}'
                }

        # Save audio file
        audio_filename = f"audio_kokoro_{int(time.time())}.wav"
        audio_path = os.path.join(os.path.dirname(__file__), '..', 'static', 'audio', audio_filename)

        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(audio_path), exist_ok=True)

        # Save the audio using soundfile
        sf.write(audio_path, audio, 24000)  # Kokoro uses 24kHz sample rate

        print(f"DEBUG: Kokoro audio saved: {audio_path}")

        # Calculate duration
        try:
            import wave
            with wave.open(audio_path, 'rb') as wav_file:
                frames = wav_file.getnframes()
                sample_rate = wav_file.getframerate()
                duration_seconds = frames / sample_rate
                duration_str = f"{int(duration_seconds // 60)}:{int(duration_seconds % 60):02d}"
                print(f"DEBUG: Kokoro audio duration: {duration_str}")
        except Exception as e:
            print(f"DEBUG: Could not get duration: {e}")
            duration_str = f'{len(text) // 150} min'

        return {
            'success': True,
            'audio_url': f'/static/audio/{audio_filename}',
            'duration': duration_str,
            'service': 'kokoro'
        }

    except Exception as e:
        print(f"DEBUG: Kokoro generation error: {e}")
        return {
            'success': False,
            'error': f'Erro ao gerar áudio com Kokoro: {str(e)}'
        }

def generate_tts_with_gemini(text, api_key, voice_name='Kore', model='gemini-2.5-flash-preview-tts'):
    """Generate TTS audio using Google Gemini 2.5 TTS models"""
    try:
        if not GOOGLE_GENAI_TTS_AVAILABLE:
            return {
                'success': False,
                'error': 'Biblioteca google-genai não instalada. Execute: pip install google-genai'
            }

        print(f"DEBUG: Starting Gemini TTS generation...")
        print(f"DEBUG: Text length: {len(text)}")
        print(f"DEBUG: Voice: {voice_name}")
        print(f"DEBUG: Model: {model}")

        # Initialize the client
        client = google_genai.Client(api_key=api_key)

        # Create the prompt for TTS
        prompt = f"Say cheerfully: {text}"

        # Generate TTS audio
        response = client.models.generate_content(
            model=model,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_modalities=["AUDIO"],
                speech_config=types.SpeechConfig(
                    voice_config=types.VoiceConfig(
                        prebuilt_voice_config=types.PrebuiltVoiceConfig(
                            voice_name=voice_name,
                        )
                    )
                ),
            )
        )

        print(f"DEBUG: Gemini TTS response received")

        # Extract audio data
        if not response.candidates or not response.candidates[0].content.parts:
            return {
                'success': False,
                'error': 'Gemini não retornou dados de áudio'
            }

        audio_data = response.candidates[0].content.parts[0].inline_data.data

        if not audio_data:
            return {
                'success': False,
                'error': 'Dados de áudio vazios retornados pelo Gemini'
            }

        print(f"DEBUG: Audio data received, size: {len(audio_data)} bytes")

        # Save audio file
        audio_filename = f"audio_gemini_{int(time.time())}.wav"
        audio_path = os.path.join(os.path.dirname(__file__), '..', 'static', 'audio', audio_filename)

        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(audio_path), exist_ok=True)

        # Save the audio data as WAV file
        def save_wave_file(filename, pcm_data, channels=1, rate=24000, sample_width=2):
            with wave.open(filename, "wb") as wf:
                wf.setnchannels(channels)
                wf.setsampwidth(sample_width)
                wf.setframerate(rate)
                wf.writeframes(pcm_data)

        # Save the audio
        save_wave_file(audio_path, audio_data)

        print(f"DEBUG: Gemini audio saved: {audio_path}")

        # Calculate duration
        try:
            with wave.open(audio_path, 'rb') as wav_file:
                frames = wav_file.getnframes()
                sample_rate = wav_file.getframerate()
                duration_seconds = frames / sample_rate
                duration_str = f"{int(duration_seconds // 60)}:{int(duration_seconds % 60):02d}"
                print(f"DEBUG: Gemini audio duration: {duration_str}")
        except Exception as e:
            print(f"DEBUG: Could not get duration: {e}")
            duration_str = f'{len(text) // 150} min'

        return {
            'success': True,
            'audio_url': f'/static/audio/{audio_filename}',
            'duration': duration_str,
            'service': 'gemini',
            'voice': voice_name,
            'model': model
        }

    except Exception as e:
        print(f"DEBUG: Gemini TTS generation error: {e}")
        import traceback
        traceback.print_exc()
        return {
            'success': False,
            'error': f'Erro ao gerar áudio com Gemini: {str(e)}'
        }

@content_processor_bp.route('/generate-image-together', methods=['POST'])
def generate_image_together():
    """Generate image using Together.ai FLUX.1-schnell model"""
    try:
        data = request.get_json()
        prompt = data.get('prompt', '').strip()
        api_key = data.get('api_key', '').strip()
        width = data.get('width', 1024)
        height = data.get('height', 1024)
        model = data.get('model', 'black-forest-labs/FLUX.1-schnell-Free')

        if not prompt:
            return jsonify({
                'success': False,
                'error': 'Prompt é obrigatório'
            })

        if not api_key:
            return jsonify({
                'success': False,
                'error': 'API key do Together.ai é obrigatória'
            })

        print(f"DEBUG: Generating image with Together.ai - Prompt: {prompt[:50]}...")

        # Together.ai API endpoint
        url = "https://api.together.xyz/v1/images/generations"

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": model,
            "prompt": prompt,
            "width": width,
            "height": height,
            "steps": 4,  # FLUX.1-schnell uses 4 steps
            "n": 1
        }

        print(f"DEBUG: Together.ai request payload: {payload}")

        response = requests.post(url, headers=headers, json=payload, timeout=60)

        print(f"DEBUG: Together.ai response status: {response.status_code}")
        print(f"DEBUG: Together.ai response: {response.text[:500]}...")

        if response.status_code == 200:
            result = response.json()

            if 'data' in result and len(result['data']) > 0:
                image_url = result['data'][0]['url']

                return jsonify({
                    'success': True,
                    'image_url': image_url,
                    'model': model,
                    'dimensions': f"{width}x{height}"
                })
            else:
                return jsonify({
                    'success': False,
                    'error': 'Nenhuma imagem foi gerada'
                })
        else:
            error_msg = f"Erro da API Together.ai: {response.status_code}"
            try:
                error_data = response.json()
                if 'error' in error_data:
                    error_msg = error_data['error'].get('message', error_msg)
            except:
                pass

            return jsonify({
                'success': False,
                'error': error_msg
            })

    except requests.exceptions.Timeout:
        return jsonify({
            'success': False,
            'error': 'Timeout na requisição para Together.ai'
        })
    except requests.exceptions.RequestException as e:
        return jsonify({
            'success': False,
            'error': f'Erro de conexão com Together.ai: {str(e)}'
        })
    except Exception as e:
        print(f"DEBUG: Together.ai generation error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': f'Erro ao gerar imagem com Together.ai: {str(e)}'
        })
