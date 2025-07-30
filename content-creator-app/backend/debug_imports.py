#!/usr/bin/env python3
"""
Script para debugar as importações do Google GenAI
"""

import sys
import os

print("=" * 60)
print("DEBUG: Verificando importações do Google GenAI")
print("=" * 60)

print(f"Python executable: {sys.executable}")
print(f"Python version: {sys.version}")
print(f"Current working directory: {os.getcwd()}")
print()

# Verificar se estamos no ambiente virtual correto
print("Verificando ambiente virtual...")
if 'venv' in sys.executable:
    print("✅ Executando no ambiente virtual")
else:
    print("❌ NÃO está no ambiente virtual!")
print()

# Testar importação da biblioteca google-genai
print("Testando importação: from google import genai")
try:
    from google import genai as google_genai
    print("✅ Importação 'from google import genai' bem-sucedida")
except ImportError as e:
    print(f"❌ Erro na importação 'from google import genai': {e}")
    google_genai = None

print()

# Testar importação dos types
print("Testando importação: from google.genai import types")
try:
    from google.genai import types
    print("✅ Importação 'from google.genai import types' bem-sucedida")
except ImportError as e:
    print(f"❌ Erro na importação 'from google.genai import types': {e}")
    types = None

print()

# Simular o código do content_processor.py
print("Simulando código do content_processor.py...")
try:
    from google import genai as google_genai
    from google.genai import types
    GOOGLE_GENAI_TTS_AVAILABLE = True
    print("✅ GOOGLE_GENAI_TTS_AVAILABLE = True")
except ImportError as e:
    GOOGLE_GENAI_TTS_AVAILABLE = False
    print(f"❌ GOOGLE_GENAI_TTS_AVAILABLE = False (Erro: {e})")

print()

# Verificar se a biblioteca está instalada
print("Verificando instalação da biblioteca...")
try:
    import pkg_resources
    installed_packages = [d.project_name for d in pkg_resources.working_set]
    if 'google-genai' in installed_packages:
        print("✅ Biblioteca 'google-genai' está instalada")
        # Obter versão
        version = pkg_resources.get_distribution('google-genai').version
        print(f"   Versão: {version}")
    else:
        print("❌ Biblioteca 'google-genai' NÃO está instalada")
except Exception as e:
    print(f"❌ Erro ao verificar instalação: {e}")

print()

# Verificar path do Python
print("Python path:")
for i, path in enumerate(sys.path[:5]):  # Mostrar apenas os primeiros 5
    print(f"  {i}: {path}")

print()

# Tentar importar diretamente
print("Teste final de importação...")
try:
    import google.genai
    print("✅ 'import google.genai' funcionou")
    
    # Verificar se tem os atributos necessários
    if hasattr(google.genai, 'Client'):
        print("✅ google.genai.Client está disponível")
    else:
        print("❌ google.genai.Client NÃO está disponível")
        
    if hasattr(google.genai, 'types'):
        print("✅ google.genai.types está disponível")
    else:
        print("❌ google.genai.types NÃO está disponível")
        
except ImportError as e:
    print(f"❌ 'import google.genai' falhou: {e}")

print()
print("=" * 60)
print("FIM DO DEBUG")
print("=" * 60)
