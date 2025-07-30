import React, { useState } from 'react';
import { Play, Loader2, Volume2, Download, AlertCircle, CheckCircle } from 'lucide-react';

const TestGeminiTTS = () => {
  const [text, setText] = useState('Olá! Este é um teste do sistema de síntese de voz do Gemini. Como você pode ouvir, a qualidade do áudio é excelente!');
  const [apiKey, setApiKey] = useState('');
  const [voiceName, setVoiceName] = useState('Kore');
  const [model, setModel] = useState('gemini-2.5-flash-preview-tts');
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const [duration, setDuration] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Available voices from Gemini TTS
  const availableVoices = [
    { value: 'Zephyr', label: 'Zephyr - Bright' },
    { value: 'Puck', label: 'Puck - Upbeat' },
    { value: 'Charon', label: 'Charon - Informativo' },
    { value: 'Kore', label: 'Kore - Firm' },
    { value: 'Fenrir', label: 'Fenrir - Excitável' },
    { value: 'Leda', label: 'Leda - Youthful' },
    { value: 'Orus', label: 'Orus - Empresa' },
    { value: 'Aoede', label: 'Aoede - Breezy' },
    { value: 'Callirrhoe', label: 'Callirrhoe - Tranquila' },
    { value: 'Autonoe', label: 'Autonoe - Bright' },
    { value: 'Enceladus', label: 'Enceladus - Breathy' },
    { value: 'Iapetus', label: 'Iapetus - Clear' },
    { value: 'Umbriel', label: 'Umbriel - Tranquila' },
    { value: 'Algieba', label: 'Algieba - Smooth' },
    { value: 'Despina', label: 'Despina - Smooth' },
    { value: 'Erinome', label: 'Erinome - Clear' },
    { value: 'Algenib', label: 'Algenib - Gravelly' },
    { value: 'Rasalgethi', label: 'Rasalgethi - Informativo' },
    { value: 'Laomedeia', label: 'Laomedeia - Upbeat' },
    { value: 'Achernar', label: 'Achernar - Suave' }
  ];

  const availableModels = [
    { value: 'gemini-2.5-flash-preview-tts', label: 'Gemini 2.5 Flash TTS (Preview)' },
    { value: 'gemini-2.5-pro-preview-tts', label: 'Gemini 2.5 Pro TTS (Preview)' }
  ];

  const generateTTS = async () => {
    if (!text.trim()) {
      setError('Por favor, insira um texto para converter em áudio');
      return;
    }

    if (!apiKey.trim()) {
      setError('Por favor, insira sua chave da API Gemini');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setAudioUrl('');

    try {
      const response = await fetch('http://localhost:5000/api/generate-tts-gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          api_key: apiKey,
          voice_name: voiceName,
          model: model
        })
      });

      const data = await response.json();

      if (data.success) {
        setAudioUrl(`http://localhost:5000${data.audio_url}`);
        setDuration(data.duration);
        setSuccess(`Áudio gerado com sucesso! Duração: ${data.duration}`);
      } else {
        setError(data.error || 'Erro desconhecido ao gerar áudio');
      }
    } catch (err) {
      setError(`Erro na requisição: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const playAudio = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(err => {
        setError(`Erro ao reproduzir áudio: ${err.message}`);
      });
    }
  };

  const downloadAudio = () => {
    if (audioUrl) {
      const link = document.createElement('a');
      link.href = audioUrl;
      link.download = `gemini_tts_${Date.now()}.wav`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-900 text-white rounded-lg">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
          <Volume2 className="h-8 w-8 text-red-500 mr-3" />
          Teste Gemini TTS
        </h1>
        <p className="text-gray-400">
          Teste a funcionalidade de conversão de texto em voz usando a API Gemini 2.5 TTS
        </p>
      </div>

      {/* API Key Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Chave da API Gemini
        </label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Insira sua chave da API Gemini"
          className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
      </div>

      {/* Text Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Texto para Conversão
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Digite o texto que deseja converter em áudio..."
          rows={4}
          className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
        <div className="text-sm text-gray-400 mt-1">
          Caracteres: {text.length}
        </div>
      </div>

      {/* Voice Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Voz
          </label>
          <select
            value={voiceName}
            onChange={(e) => setVoiceName(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            {availableVoices.map(voice => (
              <option key={voice.value} value={voice.value}>
                {voice.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Modelo
          </label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            {availableModels.map(modelOption => (
              <option key={modelOption.value} value={modelOption.value}>
                {modelOption.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Generate Button */}
      <div className="mb-6">
        <button
          onClick={generateTTS}
          disabled={loading || !text.trim() || !apiKey.trim()}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 px-6 rounded-md flex items-center justify-center text-lg font-semibold"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Gerando Áudio...
            </>
          ) : (
            <>
              <Volume2 className="h-5 w-5 mr-2" />
              Gerar Áudio com Gemini TTS
            </>
          )}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-900 border border-red-700 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
          <div className="text-red-200">{error}</div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-green-900 border border-green-700 rounded-md flex items-start">
          <CheckCircle className="h-5 w-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
          <div className="text-green-200">{success}</div>
        </div>
      )}

      {/* Audio Player */}
      {audioUrl && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Áudio Gerado</h3>
          
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={playAudio}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md flex items-center"
            >
              <Play className="h-4 w-4 mr-2" />
              Reproduzir
            </button>
            
            <button
              onClick={downloadAudio}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </button>
            
            {duration && (
              <span className="text-gray-400">
                Duração: {duration}
              </span>
            )}
          </div>

          <audio controls className="w-full">
            <source src={audioUrl} type="audio/wav" />
            Seu navegador não suporta o elemento de áudio.
          </audio>
        </div>
      )}
    </div>
  );
};

export default TestGeminiTTS;
