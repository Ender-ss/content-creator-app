# Guia de Instalação dos Serviços TTS

## Serviços Disponíveis

### 🟢 Serviços Prontos para Uso

#### 1. Microsoft Edge TTS (Gratuito)
- ✅ **Já configurado** - Funciona imediatamente
- 🎯 **Uso**: Ideal para testes e uso básico
- 🌍 **Idiomas**: Português, Inglês e muitos outros
- 💰 **Custo**: Gratuito

### 🔧 Serviços que Requerem Configuração

#### 2. Google Gemini TTS (Recomendado)
- 🆕 **Novo serviço** com 30 vozes de alta qualidade
- 📋 **Configuração**:
  1. Acesse [Google AI Studio](https://aistudio.google.com/)
  2. Crie uma conta Google
  3. Gere uma API Key
  4. Cole a chave na página **Configurações** do app
- 💰 **Custo**: Pago por uso (muito acessível)

#### 3. ElevenLabs (Premium)
- 🏆 **Melhor qualidade** comercial
- 📋 **Configuração**:
  1. Acesse [ElevenLabs](https://elevenlabs.io/)
  2. Crie uma conta
  3. Gere uma API Key
  4. Cole a chave na página **Configurações** do app
- 💰 **Custo**: Planos pagos a partir de $5/mês

#### 4. OpenAI TTS
- 🤖 **Integração com ChatGPT**
- 📋 **Configuração**:
  1. Acesse [OpenAI Platform](https://platform.openai.com/)
  2. Crie uma conta
  3. Gere uma API Key
  4. Cole a chave na página **Configurações** do app
- 💰 **Custo**: $15 por 1M caracteres

### 🔬 Serviços Open Source (Avançado)

#### 5. Chatterbox TTS (Open Source)
- 🏆 **Melhor TTS open source** disponível
- 🎭 **Controle de emoção** único
- 🚀 **Instalação**:

```bash
# 1. Ative o ambiente virtual do projeto
cd Documents\APP\content-creator-app
venv\Scripts\activate

# 2. Instale o Chatterbox
pip install chatterbox-tts

# 3. Reinicie o backend
# Pare o servidor (Ctrl+C) e execute novamente:
cd content-creator-app\backend
python src\main.py
```

- ⚠️ **Requisitos**: 
  - GPU recomendada (funciona em CPU mas é mais lento)
  - ~2GB de espaço para o modelo
  - Python 3.11 recomendado

#### 6. Coqui TTS (Local)
- 🔧 **Instalação manual** necessária
- 📋 **Configuração**:
```bash
pip install coqui-tts
```

#### 7. Kokoro TTS (Experimental)
- 🧪 **Em desenvolvimento**
- 📋 **Instalação manual** necessária

## Recomendações por Uso

### 📝 Para Testes e Desenvolvimento
1. **Edge TTS** - Gratuito e imediato
2. **Chatterbox** - Se você tem GPU e quer qualidade

### 🎙️ Para Produção de Conteúdo
1. **Gemini TTS** - Melhor custo-benefício
2. **ElevenLabs** - Máxima qualidade
3. **Chatterbox** - Open source com controle total

### 🎬 Para Roteiros Longos (1h+)
1. **Gemini TTS** - Rápido e confiável
2. **Chatterbox** - Controle de emoção
3. Use a função "Gerar em Segmentos" para qualquer serviço

## Solução de Problemas

### ❌ Áudio com 0 segundos
**Possíveis causas:**
1. **API Key inválida** - Verifique nas Configurações
2. **Texto muito longo** - Use "Gerar em Segmentos"
3. **Serviço indisponível** - Tente outro serviço
4. **Cota excedida** - Verifique limites da API

**Soluções:**
1. Teste com Edge TTS primeiro
2. Verifique as chaves de API
3. Use textos menores para teste
4. Consulte os logs do backend

### 🔧 Chatterbox não funciona
1. Verifique se está instalado: `pip list | grep chatterbox`
2. Reinstale: `pip uninstall chatterbox-tts && pip install chatterbox-tts`
3. Verifique se tem espaço em disco (2GB+)
4. Teste com GPU se disponível

### 🌐 Problemas de conexão
1. Verifique sua conexão com a internet
2. Teste com serviços locais (Edge, Chatterbox)
3. Verifique se não há firewall bloqueando

## Suporte

Se precisar de ajuda:
1. Verifique os logs do backend no terminal
2. Teste com diferentes serviços
3. Use textos simples para diagnóstico
4. Consulte a documentação oficial de cada serviço
