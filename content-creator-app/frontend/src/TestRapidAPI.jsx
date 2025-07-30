import React, { useState } from 'react';

const TestRapidAPI = () => {
  const [apiKey, setApiKey] = useState('');
  const [channelId, setChannelId] = useState('UCg6gPGh8HU2U01vaFCAsvmQ');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const testChannelVideos = async () => {
    if (!apiKey.trim()) {
      setError('Por favor, insira a chave da API');
      return;
    }

    setLoading(true);
    setError('');
    setResponse(null);

    try {
      const url = 'https://youtube-v2.p.rapidapi.com/channel/videos';
      const headers = {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'youtube-v2.p.rapidapi.com'
      };
      
      const params = new URLSearchParams({
        channel_id: channelId
      });

      const fullUrl = `${url}?${params}`;
      
      console.log('Fazendo requisição para:', fullUrl);
      console.log('Headers:', headers);

      const apiResponse = await fetch(fullUrl, {
        method: 'GET',
        headers: headers
      });

      console.log('Status da resposta:', apiResponse.status);

      if (!apiResponse.ok) {
        throw new Error(`Erro HTTP: ${apiResponse.status}`);
      }

      const data = await apiResponse.json();
      console.log('Dados recebidos:', data);
      
      setResponse(data);
    } catch (err) {
      console.error('Erro na requisição:', err);
      setError(`Erro: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testChannelId = async () => {
    if (!apiKey.trim()) {
      setError('Por favor, insira a chave da API');
      return;
    }

    setLoading(true);
    setError('');
    setResponse(null);

    try {
      const url = 'https://youtube-v2.p.rapidapi.com/channel/id';
      const headers = {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'youtube-v2.p.rapidapi.com'
      };
      
      const params = new URLSearchParams({
        channel_name: 'InspiringLifeStories7'
      });

      const fullUrl = `${url}?${params}`;
      
      console.log('Fazendo requisição para:', fullUrl);

      const apiResponse = await fetch(fullUrl, {
        method: 'GET',
        headers: headers
      });

      if (!apiResponse.ok) {
        throw new Error(`Erro HTTP: ${apiResponse.status}`);
      }

      const data = await apiResponse.json();
      console.log('Dados recebidos:', data);
      
      setResponse(data);
    } catch (err) {
      console.error('Erro na requisição:', err);
      setError(`Erro: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testChannelDetails = async () => {
    if (!apiKey.trim()) {
      setError('Por favor, insira a chave da API');
      return;
    }

    setLoading(true);
    setError('');
    setResponse(null);

    try {
      const url = 'https://youtube-v2.p.rapidapi.com/channel/details';
      const headers = {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'youtube-v2.p.rapidapi.com'
      };
      
      const params = new URLSearchParams({
        channel_id: channelId
      });

      const fullUrl = `${url}?${params}`;
      
      console.log('Fazendo requisição para:', fullUrl);

      const apiResponse = await fetch(fullUrl, {
        method: 'GET',
        headers: headers
      });

      if (!apiResponse.ok) {
        throw new Error(`Erro HTTP: ${apiResponse.status}`);
      }

      const data = await apiResponse.json();
      console.log('Dados recebidos:', data);
      
      setResponse(data);
    } catch (err) {
      console.error('Erro na requisição:', err);
      setError(`Erro: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          🧪 Teste RapidAPI YouTube V2
        </h1>

        {/* Configuração */}
        <div className="bg-gray-900 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Configuração</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Chave da API RapidAPI
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Sua chave da API"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Channel ID
              </label>
              <input
                type="text"
                value={channelId}
                onChange={(e) => setChannelId(e.target.value)}
                placeholder="UCg6gPGh8HU2U01vaFCAsvmQ"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Botões de Teste */}
        <div className="bg-gray-900 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Endpoints de Teste</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={testChannelId}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded-md font-medium transition-colors"
            >
              {loading ? 'Testando...' : 'GET /channel/id'}
            </button>
            
            <button
              onClick={testChannelDetails}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-4 py-2 rounded-md font-medium transition-colors"
            >
              {loading ? 'Testando...' : 'GET /channel/details'}
            </button>
            
            <button
              onClick={testChannelVideos}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 px-4 py-2 rounded-md font-medium transition-colors"
            >
              {loading ? 'Testando...' : 'GET /channel/videos'}
            </button>
          </div>
        </div>

        {/* Erro */}
        {error && (
          <div className="bg-red-900 border border-red-700 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-red-300 mb-2">Erro</h3>
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Resposta */}
        {response && (
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Resposta da API</h2>
            
            {/* Resumo */}
            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <h3 className="text-lg font-semibold mb-2">Resumo</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Chaves:</span>
                  <div className="font-mono text-blue-300">
                    {Object.keys(response).join(', ')}
                  </div>
                </div>
                
                {response.videos && (
                  <div>
                    <span className="text-gray-400">Total de Vídeos:</span>
                    <div className="font-mono text-green-300">
                      {response.videos.length}
                    </div>
                  </div>
                )}
                
                {response.continuation_token && (
                  <div>
                    <span className="text-gray-400">Continuation Token:</span>
                    <div className="font-mono text-yellow-300">
                      Presente
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Estrutura do Primeiro Vídeo */}
            {response.videos && response.videos.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-semibold mb-2">Estrutura do Primeiro Vídeo</h3>
                <pre className="text-sm bg-gray-900 p-3 rounded overflow-x-auto">
                  {JSON.stringify(response.videos[0], null, 2)}
                </pre>
              </div>
            )}

            {/* JSON Completo */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">JSON Completo</h3>
              <pre className="text-sm bg-gray-900 p-3 rounded overflow-x-auto max-h-96 overflow-y-auto">
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestRapidAPI;