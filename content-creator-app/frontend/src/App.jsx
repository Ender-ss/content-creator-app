import React, { useState, useEffect } from 'react';
import { Upload, Play, Download, Settings, FileText, Image, Video, Music, Wand2, Eye, EyeOff, CheckCircle, Cog, AlertCircle, Loader2, Search, Home, Lightbulb, BookOpen, Mic, ImageIcon, Filter, Calendar, TrendingUp, BarChart3, Link, TestTube, RefreshCw, Copy, Plus, Trash2, Bot, Zap, Scissors, Type, Volume2 } from 'lucide-react';
import TestRapidAPI from './TestRapidAPI';
import TestGeminiTTS from './TestGeminiTTS';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('inicio');
  const [projectData, setProjectData] = useState({
    youtubeUrl: 'https://www.youtube.com/@InspiringLifeStories7',
    title: '',
    summary: '',
    script: '',
    audioFiles: [],
    images: [],
    finalVideo: null
  });
  const [extractionConfig, setExtractionConfig] = useState({
    maxTitles: 3,
    minViews: 1000,
    maxViews: 1000000,
    filterPopular: true,
    recentOnly: true,
    autoSummary: true,
    daysPeriod: 3
  });
  const [apis, setApis] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiKeys, setApiKeys] = useState({});
  const [showApiKeys, setShowApiKeys] = useState({});
  const [extractedTitles, setExtractedTitles] = useState([]);
  const [selectedTitleIndex, setSelectedTitleIndex] = useState(null);
  const [videoData, setVideoData] = useState(null);
  const [apiValidation, setApiValidation] = useState({});
  const [testingService, setTestingService] = useState(null);
  const [testResults, setTestResults] = useState({});

  // Estados para geração de títulos com IA
  const [selectedAiAgent, setSelectedAiAgent] = useState('gemini');
  const [aiInstructions, setAiInstructions] = useState('Crie títulos virais e chamativos baseados nos títulos fornecidos. Mantenha o mesmo tom e estilo, mas torne-os mais atrativos para o público brasileiro do YouTube.');
  const [importedTitles, setImportedTitles] = useState([]);
  const [generatedTitles, setGeneratedTitles] = useState([]);
  const [isGeneratingTitles, setIsGeneratingTitles] = useState(false);
  const [titleGenerationError, setTitleGenerationError] = useState('');
  const [generatedSummaries, setGeneratedSummaries] = useState({});
  const [selectedSummaryAgent, setSelectedSummaryAgent] = useState('gemini');
  
  // Estados para geração de roteiros com IA
  const [scriptTitle, setScriptTitle] = useState('');
  const [scriptContext, setScriptContext] = useState('');
  const [numChapters, setNumChapters] = useState(10);
  const [selectedScriptAgent, setSelectedScriptAgent] = useState('chatgpt');
  const [generatedScript, setGeneratedScript] = useState(null);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [scriptGenerationError, setScriptGenerationError] = useState('');

  // Estados para geração de premissas com IA
  const [premiseTitle, setPremiseTitle] = useState('');
  const [premiseResume, setPremiseResume] = useState('');
  const [premiseAgentPrompt, setPremiseAgentPrompt] = useState(`# Gerador Automático de Premissas Narrativas

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

Apresente ao usuário SOMENTE a premissa final completa em texto corrido (resultado da Etapa 07). Não inclua título, explicações, etapas intermediárias ou qualquer outro elemento além da premissa em si.`);
  const [selectedPremiseAgent, setSelectedPremiseAgent] = useState('gemini');
  const [generatedPremise, setGeneratedPremise] = useState('');
  const [isGeneratingPremise, setIsGeneratingPremise] = useState(false);
  const [premiseGenerationError, setPremiseGenerationError] = useState('');

  // Estados para geração de áudio com IA
  const [audioText, setAudioText] = useState('');
  const [selectedAudioService, setSelectedAudioService] = useState('gemini');
  const [selectedVoice, setSelectedVoice] = useState('');
  const [audioSettings, setAudioSettings] = useState({
    speed: 1.0,
    pitch: 1.0,
    stability: 0.5,
    clarity: 0.75
  });
  const [generatedAudio, setGeneratedAudio] = useState(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioGenerationError, setAudioGenerationError] = useState('');
  const [availableVoices, setAvailableVoices] = useState([]);

  // Estados específicos para Gemini TTS
  const [selectedGeminiVoice, setSelectedGeminiVoice] = useState('Kore');
  const [selectedGeminiModel, setSelectedGeminiModel] = useState('gemini-2.5-flash-preview-tts');
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState('');
  const [audioDuration, setAudioDuration] = useState('');
  const [audioHistory, setAudioHistory] = useState([]);
  const [geminiGenerationType, setGeminiGenerationType] = useState('simple'); // 'simple' ou 'segments'
  const [geminiSegments, setGeminiSegments] = useState([]);
  const [isGeneratingGeminiSegments, setIsGeneratingGeminiSegments] = useState(false);

  // Estados para geração de imagens
  const [imagePrompt, setImagePrompt] = useState('');
  const [selectedImageService, setSelectedImageService] = useState('pollinations');
  const [imageSettings, setImageSettings] = useState({
    width: 1920,
    height: 1080,
    model: 'flux-realism',
    enhance: true,
    style: 'realistic'
  });
  const [generatedImages, setGeneratedImages] = useState([]);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageGenerationError, setImageGenerationError] = useState('');
  const [imageQueue, setImageQueue] = useState([]);
  const [currentImageGeneration, setCurrentImageGeneration] = useState(null);

  // Estados para rotação de APIs Gemini
  const [geminiApiKeys, setGeminiApiKeys] = useState([]);
  const [currentGeminiApiIndex, setCurrentGeminiApiIndex] = useState(0);
  const [geminiUsageToday, setGeminiUsageToday] = useState({});
  const [showGeminiApiManager, setShowGeminiApiManager] = useState(false);

  // Estados para divisão e junção de áudio
  const [audioSegments, setAudioSegments] = useState([]);
  const [isGeneratingSegments, setIsGeneratingSegments] = useState(false);
  const [segmentGenerationProgress, setSegmentGenerationProgress] = useState(0);
  const [isJoiningAudio, setIsJoiningAudio] = useState(false);
  const [finalAudio, setFinalAudio] = useState(null);

  useEffect(() => {
    const savedApiKeys = localStorage.getItem('contentCreatorApiKeys');
    if (savedApiKeys) {
      setApiKeys(JSON.parse(savedApiKeys));
    }
    
    setTimeout(() => {
      setApis([
        {
          api_name: 'rapidapi_youtube',
          display_name: 'RapidAPI YouTube V2',
          api_type: 'freemium',
          category: 'youtube_scraping',
          is_required: false,
          is_configured: false,
          status: 'not_configured',
          usage_count: 0,
          last_tested: null,
          description: 'YouTube V2 API do RapidAPI para extração de dados de canais e vídeos'
        }
      ]);
    }, 1000);
  }, []);

  // Função para testar serviços TTS
  const testTTSService = async (service, voiceId, text) => {
    setTestingService(service);
    setTestResults(prev => ({ ...prev, [service]: null }));

    try {
      const response = await fetch('http://localhost:5000/api/generate-audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service: service,
          text: text,
          voice_id: voiceId,
          settings: {
            speed: 1.0,
            pitch: 1.0
          },
          api_key: apiKeys[service] || ''
        }),
      });

      const result = await response.json();
      setTestResults(prev => ({ ...prev, [service]: result }));

    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [service]: {
          success: false,
          error: `Erro de conexão: ${error.message}`
        }
      }));
    } finally {
      setTestingService(null);
    }
  };

  const validateApiKey = async (apiName, apiKey) => {
    setApiValidation(prev => ({ ...prev, [apiName]: 'validating' }));
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const isValid = apiKey && apiKey.length > 10;
      
      setApiValidation(prev => ({ 
        ...prev, 
        [apiName]: isValid ? 'valid' : 'invalid' 
      }));
      
      return isValid;
    } catch (error) {
      setApiValidation(prev => ({ ...prev, [apiName]: 'invalid' }));
      return false;
    }
  };

  // Função para importar títulos da pesquisa
  const importTitlesFromSearch = () => {
    if (extractedTitles.length === 0) {
      setTitleGenerationError('Nenhum título foi extraído na pesquisa. Vá para a página de Pesquisa primeiro.');
      return;
    }
    
    const titlesToImport = extractedTitles.map(title => ({
      id: title.id,
      title: title.title,
      views: title.estimatedViews,
      imported: true
    }));
    
    setImportedTitles(titlesToImport);
    setTitleGenerationError('');
  };

  // Função para gerar títulos com IA
  const generateTitlesWithAI = async () => {
    if (importedTitles.length === 0) {
      setTitleGenerationError('Importe títulos da pesquisa primeiro.');
      return;
    }

    const selectedApiKey = apiKeys[selectedAiAgent === 'chatgpt' ? 'openai' : selectedAiAgent];
    if (!selectedApiKey) {
      setTitleGenerationError(`Configure a chave da API ${selectedAiAgent.toUpperCase()} nas Configurações primeiro.`);
      return;
    }

    try {
      setIsGeneratingTitles(true);
      setTitleGenerationError('');

      const response = await fetch('http://localhost:5000/api/generate-titles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agent: selectedAiAgent,
          api_key: selectedApiKey,
          instructions: aiInstructions,
          source_titles: importedTitles.map(t => t.title)
        })
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.generated_titles) {
        const formattedTitles = data.generated_titles.map((title, index) => ({
          id: `generated_${Date.now()}_${index}`,
          title: title,
          agent: selectedAiAgent,
          generated_at: new Date().toISOString(),
          score: Math.floor(Math.random() * 20) + 80, // Score estimado
          estimated_ctr: `${(Math.random() * 5 + 10).toFixed(1)}%`
        }));
        
        setGeneratedTitles(formattedTitles);
      } else {
        throw new Error(data.error || 'Erro ao gerar títulos');
      }
    } catch (error) {
      setTitleGenerationError(`Erro ao gerar títulos: ${error.message}`);
      console.error('Erro na geração de títulos:', error);
    } finally {
      setIsGeneratingTitles(false);
    }
  };

  // Função para gerar roteiros com IA
  const generateScriptWithAI = async () => {
    if (!scriptTitle.trim()) {
      setScriptGenerationError('Título do roteiro é obrigatório.');
      return;
    }

    const selectedApiKey = apiKeys[selectedScriptAgent === 'chatgpt' ? 'openai' : selectedScriptAgent];
    if (!selectedApiKey) {
      setScriptGenerationError(`Configure a chave da API ${selectedScriptAgent.toUpperCase()} nas Configurações primeiro.`);
      return;
    }

    try {
      setIsGeneratingScript(true);
      setScriptGenerationError('');

      const response = await fetch('http://localhost:5000/api/generate-script-chapters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agent: selectedScriptAgent,
          api_key: selectedApiKey,
          title: scriptTitle,
          context: scriptContext,
          num_chapters: numChapters
        })
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.chapters) {
        // Estruturar os dados do roteiro conforme esperado pelo frontend
        const scriptData = {
          title: data.title || scriptTitle,
          agent: data.agent || selectedScriptAgent,
          total_chapters: data.total_chapters || data.chapters.length,
          total_words: data.total_words || 0,
          chapters: data.chapters
        };
        setGeneratedScript(scriptData);
      } else {
        throw new Error(data.error || 'Erro ao gerar roteiro');
      }
    } catch (error) {
      setScriptGenerationError(`Erro ao gerar roteiro: ${error.message}`);
      console.error('Erro na geração de roteiro:', error);
    } finally {
      setIsGeneratingScript(false);
    }
  };

  // Função para gerar premissas com IA
  const generatePremiseWithAI = async () => {
    if (!premiseTitle.trim()) {
      setPremiseGenerationError('Título é obrigatório.');
      return;
    }

    const selectedApiKey = apiKeys[selectedPremiseAgent === 'chatgpt' ? 'openai' : selectedPremiseAgent];
    if (!selectedApiKey) {
      setPremiseGenerationError(`Configure a chave da API ${selectedPremiseAgent.toUpperCase()} nas Configurações primeiro.`);
      return;
    }

    try {
      setIsGeneratingPremise(true);
      setPremiseGenerationError('');

      const response = await fetch('http://localhost:5000/api/generate-premise', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agent: selectedPremiseAgent,
          api_key: selectedApiKey,
          title: premiseTitle,
          resume: premiseResume,
          agent_prompt: premiseAgentPrompt
        })
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setGeneratedPremise(data.premise);
      } else {
        throw new Error(data.error || 'Erro desconhecido');
      }
    } catch (error) {
      setPremiseGenerationError(`Erro ao gerar premissa: ${error.message}`);
      console.error('Erro na geração de premissa:', error);
    } finally {
      setIsGeneratingPremise(false);
    }
  };

  const generateSummary = async (videoId, title) => {
    const selectedApiKey = apiKeys[selectedSummaryAgent === 'chatgpt' ? 'openai' : selectedSummaryAgent];
    if (!selectedApiKey) {
      setError(`Configure a chave da API ${selectedSummaryAgent.toUpperCase()} nas Configurações primeiro.`);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await fetch('http://localhost:5000/api/generate-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agent: selectedSummaryAgent,
          api_key: selectedApiKey,
          title: title
        })
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setGeneratedSummaries(prev => ({...prev, [videoId]: data.summary}));
      } else {
        throw new Error(data.error || 'Erro ao gerar resumo');
      }
    } catch (error) {
      setError(`Erro ao gerar resumo: ${error.message}`);
      console.error('Erro na geração de resumo:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função para importar título selecionado para premissa
  const importTitleToPremise = () => {
    try {
      // Limpa erros anteriores
      setPremiseGenerationError('');

      if (generatedTitles && generatedTitles.length > 0) {
        // Prioriza títulos gerados
        const selectedTitle = generatedTitles[0];
        setPremiseTitle(selectedTitle.title);
        console.log('Título gerado importado:', selectedTitle.title);
      } else if (importedTitles && importedTitles.length > 0) {
        // Usa títulos importados como fallback
        const selectedTitle = importedTitles[0];
        setPremiseTitle(selectedTitle.title);
        console.log('Título importado usado:', selectedTitle.title);
      } else {
        // Nenhum título disponível
        setPremiseGenerationError('Nenhum título disponível para importar. Vá para a página de Títulos primeiro e gere ou importe alguns títulos.');
      }
    } catch (error) {
      console.error('Erro ao importar título:', error);
      setPremiseGenerationError('Erro ao importar título. Tente novamente.');
    }
  };

  // Função para exportar roteiro completo
  const exportScript = () => {
    if (!generatedScript) return;

    let scriptContent = `${generatedScript.title}\n`;
    scriptContent += `${'='.repeat(generatedScript.title.length)}\n\n`;
    
    if (generatedScript.context) {
      scriptContent += `Contexto: ${generatedScript.context}\n\n`;
    }
    
    scriptContent += `Gerado por: ${generatedScript.agent.toUpperCase()}\n`;
    scriptContent += `Total de capítulos: ${generatedScript.total_chapters}\n`;
    scriptContent += `Total de palavras: ${generatedScript.total_words}\n`;
    scriptContent += `Duração estimada: ${Math.ceil(generatedScript.total_words / 150)} minutos\n`;
    scriptContent += `Gerado em: ${new Date().toLocaleString('pt-BR')}\n\n`;
    scriptContent += `${'='.repeat(50)}\n\n`;

    generatedScript.chapters.forEach((chapter, index) => {
      scriptContent += `CAPÍTULO ${chapter.chapter_number}\n`;
      scriptContent += `${'-'.repeat(20)}\n`;
      scriptContent += `Palavras: ${chapter.word_count}\n\n`;
      scriptContent += `${chapter.content}\n\n`;
      if (index < generatedScript.chapters.length - 1) {
        scriptContent += `${'='.repeat(50)}\n\n`;
      }
    });

    const blob = new Blob([scriptContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `roteiro_${scriptTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Função para copiar capítulo
  const copyChapter = (content) => {
    navigator.clipboard.writeText(content);
    // Aqui você pode adicionar uma notificação de sucesso
  };

  // Função para remover título importado
  const removeImportedTitle = (titleId) => {
    setImportedTitles(prev => prev.filter(title => title.id !== titleId));
  };

  // Função para copiar título gerado
  const copyGeneratedTitle = (title) => {
    navigator.clipboard.writeText(title);
    // Aqui você pode adicionar uma notificação de sucesso
  };

  // Função para importar roteiro para áudio
  const importScriptToAudio = () => {
    try {
      setAudioGenerationError('');

      if (generatedScript && generatedScript.chapters && generatedScript.chapters.length > 0) {
        // Combina todos os capítulos em um texto único
        const fullScript = generatedScript.chapters
          .map(chapter => `${chapter.title}\n\n${chapter.content}`)
          .join('\n\n---\n\n');

        setAudioText(fullScript);
        console.log('Roteiro importado para áudio');
      } else {
        setAudioGenerationError('Nenhum roteiro disponível para importar. Vá para a página de Roteiros primeiro e gere um roteiro.');
      }
    } catch (error) {
      console.error('Erro ao importar roteiro:', error);
      setAudioGenerationError('Erro ao importar roteiro. Tente novamente.');
    }
  };

  // Função para carregar vozes disponíveis
  const loadAvailableVoices = async (service) => {
    try {
      const apiKey = apiKeys[service === 'elevenlabs' ? 'elevenlabs' : service];
      if (!apiKey) return;

      const response = await fetch(`http://localhost:5000/api/audio/voices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service: service,
          api_key: apiKey
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAvailableVoices(data.voices);
          if (data.voices.length > 0) {
            setSelectedVoice(data.voices[0].id);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar vozes:', error);
    }
  };

  // Função para dividir texto em segmentos de ~10 minutos
  const splitTextIntoSegments = (text, maxCharsPerSegment = 15000) => {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const segments = [];
    let currentSegment = '';

    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      if (currentSegment.length + trimmedSentence.length + 1 <= maxCharsPerSegment) {
        currentSegment += (currentSegment ? '. ' : '') + trimmedSentence;
      } else {
        if (currentSegment) {
          segments.push(currentSegment + '.');
        }
        currentSegment = trimmedSentence;
      }
    }

    if (currentSegment) {
      segments.push(currentSegment + '.');
    }

    return segments;
  };

  // Função para gerar áudio em segmentos
  const generateAudioSegments = async () => {
    if (!audioText.trim()) {
      setAudioGenerationError('Texto é obrigatório para gerar áudio.');
      return;
    }

    const apiKey = apiKeys[selectedAudioService === 'elevenlabs' ? 'elevenlabs' : selectedAudioService];
    if (!apiKey && selectedAudioService !== 'edge' && selectedAudioService !== 'coqui' && selectedAudioService !== 'kokoro') {
      setAudioGenerationError(`Configure a chave da API ${selectedAudioService.toUpperCase()} nas Configurações primeiro.`);
      return;
    }

    try {
      setIsGeneratingSegments(true);
      setAudioGenerationError('');
      setSegmentGenerationProgress(0);
      setAudioSegments([]);

      // Dividir texto em segmentos
      const textSegments = splitTextIntoSegments(audioText);
      console.log(`Dividindo em ${textSegments.length} segmentos`);

      const generatedSegments = [];

      for (let i = 0; i < textSegments.length; i++) {
        const segment = textSegments[i];
        setSegmentGenerationProgress(Math.round(((i + 1) / textSegments.length) * 100));

        const response = await fetch('http://localhost:5000/api/generate-audio', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            service: selectedAudioService,
            api_key: apiKey,
            text: segment,
            voice_id: selectedVoice,
            settings: audioSettings,
            segment_index: i + 1,
            total_segments: textSegments.length
          })
        });

        if (!response.ok) {
          throw new Error(`Erro na API para segmento ${i + 1}: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          generatedSegments.push({
            index: i + 1,
            url: data.audio_url,
            duration: data.duration,
            text: segment.substring(0, 100) + '...',
            generated_at: new Date().toISOString()
          });
        } else {
          throw new Error(data.error || `Erro ao gerar segmento ${i + 1}`);
        }
      }

      setAudioSegments(generatedSegments);
      setSegmentGenerationProgress(100);
    } catch (error) {
      setAudioGenerationError(`Erro ao gerar segmentos de áudio: ${error.message}`);
      console.error('Erro na geração de segmentos:', error);
    } finally {
      setIsGeneratingSegments(false);
    }
  };

  // Função para juntar segmentos de áudio
  const joinAudioSegments = async () => {
    if (audioSegments.length === 0) {
      setAudioGenerationError('Nenhum segmento de áudio disponível para juntar.');
      return;
    }

    try {
      setIsJoiningAudio(true);
      setAudioGenerationError('');

      const response = await fetch('http://localhost:5000/api/join-audio-segments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          segments: audioSegments.map(seg => seg.url)
        })
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setFinalAudio({
          url: data.audio_url,
          duration: data.duration,
          segments_count: audioSegments.length,
          service: selectedAudioService,
          generated_at: new Date().toISOString()
        });
      } else {
        throw new Error(data.error || 'Erro ao juntar segmentos');
      }
    } catch (error) {
      setAudioGenerationError(`Erro ao juntar áudio: ${error.message}`);
      console.error('Erro na junção de áudio:', error);
    } finally {
      setIsJoiningAudio(false);
    }
  };

  // Função para gerar áudio (versão simples - mantida para compatibilidade)
  const generateAudioWithAI = async () => {
    if (!audioText.trim()) {
      setAudioGenerationError('Texto é obrigatório para gerar áudio.');
      return;
    }

    const apiKey = apiKeys[selectedAudioService === 'elevenlabs' ? 'elevenlabs' : selectedAudioService];
    if (!apiKey && selectedAudioService !== 'edge' && selectedAudioService !== 'coqui' && selectedAudioService !== 'kokoro') {
      setAudioGenerationError(`Configure a chave da API ${selectedAudioService.toUpperCase()} nas Configurações primeiro.`);
      return;
    }

    try {
      setIsGeneratingAudio(true);
      setAudioGenerationError('');

      const response = await fetch('http://localhost:5000/api/generate-audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service: selectedAudioService,
          api_key: apiKey,
          text: audioText,
          voice_id: selectedVoice,
          settings: audioSettings
        })
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setGeneratedAudio({
          url: data.audio_url,
          duration: data.duration,
          service: selectedAudioService,
          voice: selectedVoice,
          generated_at: new Date().toISOString()
        });
      } else {
        throw new Error(data.error || 'Erro ao gerar áudio');
      }
    } catch (error) {
      setAudioGenerationError(`Erro ao gerar áudio: ${error.message}`);
      console.error('Erro na geração de áudio:', error);
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  // Função específica para gerar áudio com Gemini TTS
  const generateGeminiAudio = async () => {
    if (!audioText.trim()) {
      setAudioGenerationError('Texto é obrigatório para gerar áudio.');
      return;
    }

    // Obter próxima API disponível
    const currentApiKey = getNextGeminiApiKey();
    if (!currentApiKey) {
      setAudioGenerationError('Nenhuma chave da API Gemini configurada. Vá para Configurações.');
      return;
    }

    setIsGeneratingAudio(true);
    setAudioGenerationError('');
    setGeneratedAudioUrl('');

    try {
      console.log('Gerando áudio com Gemini TTS...');

      const response = await fetch('http://localhost:5000/api/generate-tts-gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: audioText,
          api_key: currentApiKey,
          voice_name: selectedGeminiVoice,
          model: selectedGeminiModel
        })
      });

      const data = await response.json();

      if (data.success) {
        const audioUrl = `http://localhost:5000${data.audio_url}`;
        setGeneratedAudioUrl(audioUrl);
        setAudioDuration(data.duration);

        // Incrementar uso da API
        incrementGeminiUsage(currentApiKey);

        // Adicionar ao histórico
        const newAudioEntry = {
          url: audioUrl,
          duration: data.duration,
          service: 'Gemini TTS',
          voice: selectedGeminiVoice,
          model: selectedGeminiModel,
          text: audioText,
          timestamp: Date.now()
        };

        setAudioHistory(prev => [newAudioEntry, ...prev.slice(0, 9)]); // Manter apenas os 10 mais recentes

        console.log('Áudio gerado com sucesso:', data);
      } else {
        throw new Error(data.error || 'Erro ao gerar áudio com Gemini');
      }
    } catch (error) {
      setAudioGenerationError(`Erro ao gerar áudio: ${error.message}`);
      console.error('Erro na geração de áudio com Gemini:', error);
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  // Função para gerar áudio em segmentos com Gemini TTS
  const generateGeminiAudioSegments = async () => {
    if (!audioText.trim()) {
      setAudioGenerationError('Texto é obrigatório para gerar áudio.');
      return;
    }

    // Verificar se há APIs disponíveis
    const currentApiKey = getNextGeminiApiKey();
    if (!currentApiKey) {
      setAudioGenerationError('Nenhuma chave da API Gemini configurada. Vá para Configurações.');
      return;
    }

    setIsGeneratingGeminiSegments(true);
    setAudioGenerationError('');
    setGeminiSegments([]);

    try {
      console.log('Gerando áudio em segmentos com Gemini TTS...');

      // Dividir texto em segmentos de aproximadamente 1000 caracteres (10 minutos)
      const maxCharsPerSegment = 1000;
      const textSegments = [];
      const words = audioText.split(' ');
      let currentSegment = '';

      for (const word of words) {
        if ((currentSegment + ' ' + word).length > maxCharsPerSegment && currentSegment.length > 0) {
          textSegments.push(currentSegment.trim());
          currentSegment = word;
        } else {
          currentSegment += (currentSegment ? ' ' : '') + word;
        }
      }

      if (currentSegment.trim()) {
        textSegments.push(currentSegment.trim());
      }

      console.log(`Dividindo em ${textSegments.length} segmentos`);

      const generatedSegments = [];

      // Gerar cada segmento
      for (let i = 0; i < textSegments.length; i++) {
        const segment = textSegments[i];
        console.log(`Gerando segmento ${i + 1}/${textSegments.length}...`);

        try {
          // Obter próxima API disponível para cada segmento
          const segmentApiKey = getNextGeminiApiKey();

          const response = await fetch('http://localhost:5000/api/generate-tts-gemini', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              text: segment,
              api_key: segmentApiKey,
              voice_name: selectedGeminiVoice,
              model: selectedGeminiModel
            })
          });

          const data = await response.json();

          if (data.success) {
            // Incrementar uso da API
            incrementGeminiUsage(segmentApiKey);

            const segmentData = {
              index: i + 1,
              url: `http://localhost:5000${data.audio_url}`,
              duration: data.duration,
              text: segment.substring(0, 100) + (segment.length > 100 ? '...' : ''),
              fullText: segment,
              status: 'completed'
            };

            generatedSegments.push(segmentData);
            setGeminiSegments([...generatedSegments]);
          } else {
            throw new Error(data.error || `Erro no segmento ${i + 1}`);
          }
        } catch (segmentError) {
          console.error(`Erro no segmento ${i + 1}:`, segmentError);
          const errorSegment = {
            index: i + 1,
            url: null,
            duration: '0:00',
            text: segment.substring(0, 100) + (segment.length > 100 ? '...' : ''),
            fullText: segment,
            status: 'error',
            error: segmentError.message
          };
          generatedSegments.push(errorSegment);
          setGeminiSegments([...generatedSegments]);
        }
      }

      console.log(`Geração de segmentos concluída: ${generatedSegments.length} segmentos`);

    } catch (error) {
      setAudioGenerationError(`Erro ao gerar segmentos: ${error.message}`);
      console.error('Erro na geração de segmentos com Gemini:', error);
    } finally {
      setIsGeneratingGeminiSegments(false);
    }
  };

  // Função para gerar imagens com controle de fila
  const generateImageWithAI = async () => {
    if (!imagePrompt.trim()) {
      setImageGenerationError('Prompt é obrigatório para gerar imagem.');
      return;
    }

    // Se já está gerando, adicionar à fila
    if (isGeneratingImage) {
      const queueItem = {
        id: Date.now(),
        prompt: imagePrompt,
        service: selectedImageService,
        settings: { ...imageSettings }
      };
      setImageQueue(prev => [...prev, queueItem]);
      setImageGenerationError('Adicionado à fila. Aguarde a geração atual terminar.');
      return;
    }

    await processImageGeneration(imagePrompt, selectedImageService, imageSettings);
  };

  // Função para processar geração de imagem
  const processImageGeneration = async (prompt, service, settings) => {
    setIsGeneratingImage(true);
    setImageGenerationError('');
    setCurrentImageGeneration({ prompt, service, settings });

    try {
      console.log('Gerando imagem com:', service);

      let imageUrl = '';

      if (service === 'pollinations') {
        // Pollinations AI - Gratuito
        const encodedPrompt = encodeURIComponent(prompt);
        const seed = Math.floor(Math.random() * 1000000);
        imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${settings.width}&height=${settings.height}&model=${settings.model}&enhance=${settings.enhance}&nologo=true&nofeed=true&seed=${seed}`;

        // Testar se a imagem carrega
        const img = document.createElement('img');
        img.crossOrigin = 'anonymous';

        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = imageUrl;
        });

      } else if (service === 'together') {
        // Together.ai FLUX.1-schnell - Gratuito
        if (!apiKeys.together) {
          throw new Error('Chave da API Together.ai não configurada');
        }

        const response = await fetch('http://localhost:5000/api/generate-image-together', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: prompt,
            api_key: apiKeys.together,
            width: settings.width,
            height: settings.height,
            model: 'black-forest-labs/FLUX.1-schnell-Free'
          })
        });

        const data = await response.json();
        if (data.success) {
          imageUrl = data.image_url;
        } else {
          throw new Error(data.error || 'Erro ao gerar imagem com Together.ai');
        }

      } else if (service === 'picsum') {
        // Lorem Picsum - Fotos reais gratuitas
        const seed = Math.floor(Math.random() * 1000);
        imageUrl = `https://picsum.photos/seed/${seed}/${settings.width}/${settings.height}`;

      } else if (service === 'unsplash') {
        // Unsplash Source - Fotos HD gratuitas
        const keywords = prompt.split(' ').slice(0, 3).join(',');
        imageUrl = `https://source.unsplash.com/${settings.width}x${settings.height}/?${encodeURIComponent(keywords)}`;

      } else if (service === 'dalle') {
        // OpenAI DALL-E (requer API key)
        if (!apiKeys.openai) {
          throw new Error('Chave da API OpenAI não configurada');
        }

        const response = await fetch('http://localhost:5000/api/generate-image-dalle', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: prompt,
            api_key: apiKeys.openai,
            size: `${settings.width}x${settings.height}`,
            quality: 'hd'
          })
        });

        const data = await response.json();
        if (data.success) {
          imageUrl = data.image_url;
        } else {
          throw new Error(data.error || 'Erro ao gerar imagem com DALL-E');
        }

      } else if (service === 'gemini') {
        // Google Gemini Imagen (requer API key)
        const geminiApiKey = getNextGeminiApiKey();
        if (!geminiApiKey) {
          throw new Error('Nenhuma chave da API Gemini configurada');
        }

        const response = await fetch('http://localhost:5000/api/generate-image-gemini', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: prompt,
            api_key: geminiApiKey,
            width: settings.width,
            height: settings.height,
            style: settings.style
          })
        });

        const data = await response.json();
        if (data.success) {
          imageUrl = data.image_url;
          // Incrementar uso da API
          incrementGeminiUsage(geminiApiKey);
        } else {
          throw new Error(data.error || 'Erro ao gerar imagem com Gemini');
        }

      } else if (service === 'stability') {
        // Stability AI (requer API key)
        if (!apiKeys.stability) {
          throw new Error('Chave da API Stability AI não configurada');
        }

        const response = await fetch('http://localhost:5000/api/generate-image-stability', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: prompt,
            api_key: apiKeys.stability,
            width: settings.width,
            height: settings.height,
            style: settings.style
          })
        });

        const data = await response.json();
        if (data.success) {
          imageUrl = data.image_url;
        } else {
          throw new Error(data.error || 'Erro ao gerar imagem com Stability AI');
        }
      }

      // Adicionar imagem gerada ao histórico
      const newImage = {
        id: Date.now(),
        url: imageUrl,
        prompt: prompt,
        service: service,
        settings: { ...settings },
        timestamp: new Date().toISOString()
      };

      setGeneratedImages(prev => [newImage, ...prev.slice(0, 19)]); // Manter apenas as 20 mais recentes
      console.log('Imagem gerada com sucesso:', newImage);

    } catch (error) {
      setImageGenerationError(`Erro ao gerar imagem: ${error.message}`);
      console.error('Erro na geração de imagem:', error);
    } finally {
      setIsGeneratingImage(false);
      setCurrentImageGeneration(null);

      // Processar próximo item da fila
      if (imageQueue.length > 0) {
        const nextItem = imageQueue[0];
        setImageQueue(prev => prev.slice(1));
        setTimeout(() => {
          processImageGeneration(nextItem.prompt, nextItem.service, nextItem.settings);
        }, 1000); // Aguardar 1 segundo entre gerações
      }
    }
  };

  // Função para obter próxima API Gemini disponível
  const getNextGeminiApiKey = () => {
    if (geminiApiKeys.length === 0) {
      return apiKeys.gemini || '';
    }

    const today = new Date().toDateString();

    // Verificar se alguma API ainda tem limite disponível
    for (let i = 0; i < geminiApiKeys.length; i++) {
      const apiKey = geminiApiKeys[i];
      const usage = geminiUsageToday[apiKey] || { date: today, count: 0 };

      // Reset contador se for um novo dia
      if (usage.date !== today) {
        setGeminiUsageToday(prev => ({
          ...prev,
          [apiKey]: { date: today, count: 0 }
        }));
        return apiKey;
      }

      // Limite gratuito: 15 requests por minuto, ~1000 por dia
      if (usage.count < 950) { // Margem de segurança
        return apiKey;
      }
    }

    // Se todas as APIs atingiram o limite, usar a primeira mesmo assim
    return geminiApiKeys[0] || apiKeys.gemini || '';
  };

  // Função para incrementar uso da API Gemini
  const incrementGeminiUsage = (apiKey) => {
    const today = new Date().toDateString();
    setGeminiUsageToday(prev => ({
      ...prev,
      [apiKey]: {
        date: today,
        count: (prev[apiKey]?.count || 0) + 1
      }
    }));
  };

  // Função para adicionar nova API Gemini
  const addGeminiApiKey = (newApiKey) => {
    if (newApiKey && !geminiApiKeys.includes(newApiKey)) {
      setGeminiApiKeys(prev => [...prev, newApiKey]);

      // Salvar no localStorage
      const updatedKeys = [...geminiApiKeys, newApiKey];
      localStorage.setItem('geminiApiKeys', JSON.stringify(updatedKeys));
    }
  };

  // Função para remover API Gemini
  const removeGeminiApiKey = (apiKeyToRemove) => {
    setGeminiApiKeys(prev => prev.filter(key => key !== apiKeyToRemove));

    // Salvar no localStorage
    const updatedKeys = geminiApiKeys.filter(key => key !== apiKeyToRemove);
    localStorage.setItem('geminiApiKeys', JSON.stringify(updatedKeys));
  };

  // Carregar APIs Gemini do localStorage
  useEffect(() => {
    const savedKeys = localStorage.getItem('geminiApiKeys');
    if (savedKeys) {
      try {
        setGeminiApiKeys(JSON.parse(savedKeys));
      } catch (error) {
        console.error('Erro ao carregar APIs Gemini:', error);
      }
    }
  }, []);

  const updateApiConfig = async (apiName, apiKey) => {
    try {
      setLoading(true);
      
      const isValid = await validateApiKey(apiName, apiKey);
      
      if (isValid) {
        const updatedApiKeys = { ...apiKeys, [apiName]: apiKey };
        setApiKeys(updatedApiKeys);
        localStorage.setItem('contentCreatorApiKeys', JSON.stringify(updatedApiKeys));
        
        setApis(prevApis =>
          prevApis.map(api =>
            api.api_name === apiName
              ? {
                  ...api,
                  is_configured: true,
                  status: 'configured',
                  last_tested: new Date().toISOString()
                }
              : api
          )
        );
      }
      
      setError('');
      
    } catch (error) {
      setError('Erro ao configurar API: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const extractYouTubeContent = async () => {
    if (!projectData.youtubeUrl.trim()) {
      setError('URL do canal do YouTube é obrigatória');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const rapidApiKey = apiKeys['rapidapi_youtube'];
      
      if (rapidApiKey && rapidApiKey.trim()) {
        // Fazer chamada real para a API RapidAPI YouTube V2
        console.log('Making API call with config:', extractionConfig);
        console.log('URL:', projectData.youtubeUrl);
        
        const response = await fetch('http://localhost:5000/api/extract-youtube', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: projectData.youtubeUrl,
            api_key: rapidApiKey,
            config: extractionConfig
          })
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error:', errorText);
          throw new Error(`Erro na API: ${response.status}`);
        }

        const data = await response.json();
        console.log('Response from backend:', data);
        
        if (data.success && data.titles) {
          // Os dados já vêm filtrados do backend, apenas mapear para o formato da interface
          const formattedTitles = data.titles.map((video, index) => ({
            id: index,
            title: video.title,
            summary: video.description || 'Sem descrição disponível',
            score: Math.floor(Math.random() * 30) + 70, // Score baseado em engagement
            estimatedViews: parseInt(video.views) || 0,
            clickThroughRate: `${(Math.random() * 10 + 5).toFixed(1)}%`,
            publishedAt: video.publishedAt,
            videoId: video.videoId,
            thumbnail: video.thumbnail
          }));

          console.log('Formatted titles:', formattedTitles);
          setExtractedTitles(formattedTitles);
          setVideoData({
            id: data.channelId || 'unknown',
            originalTitle: data.channelName || 'Canal do YouTube',
            views: data.totalViews || 0,
            likes: data.totalLikes || 0,
            comments: data.totalComments || 0,
            duration: "Canal",
            publishedAt: new Date().toISOString(),
            description: data.channelDescription || 'Canal do YouTube'
          });
        } else {
          throw new Error(data.error || 'Erro ao processar dados da API');
        }
      } else {
        // Dados de demonstração quando não há API key
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const mockTitles = [
          {
            id: 0,
            title: "REVELADO: Os Segredos Por Trás das Histórias Mais Inspiradoras!",
            summary: "Descubra os segredos por trás das histórias mais inspiradoras e como você pode aplicar essas lições em sua própria vida para alcançar resultados extraordinários.",
            score: 95,
            estimatedViews: 150000,
            clickThroughRate: '18.5%',
            publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            videoId: 'demo1',
            thumbnail: 'https://via.placeholder.com/320x180'
          },
          {
            id: 1,
            title: "CHOCANTE: Como Essas Pessoas Mudaram Suas Vidas Completamente!",
            summary: "Histórias chocantes de pessoas que transformaram completamente suas vidas e como você pode seguir o mesmo caminho para o sucesso.",
            score: 88,
            estimatedViews: 120000,
            clickThroughRate: '15.2%',
            publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            videoId: 'demo2',
            thumbnail: 'https://via.placeholder.com/320x180'
          },
          {
            id: 2,
            title: "INCRÍVEL: A História Que Vai Mudar Sua Perspectiva de Vida!",
            summary: "Uma história incrível que vai transformar completamente sua perspectiva sobre os desafios da vida e como superá-los.",
            score: 92,
            estimatedViews: 180000,
            clickThroughRate: '16.8%',
            publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            videoId: 'demo3',
            thumbnail: 'https://via.placeholder.com/320x180'
          }
        ].slice(0, extractionConfig.maxTitles);
        
        setExtractedTitles(mockTitles);
        setVideoData({
          id: 'demo-channel',
          originalTitle: 'Canal de Histórias Inspiradoras (Demo)',
          views: 250000,
          likes: 15000,
          comments: 2500,
          duration: "Canal",
          publishedAt: new Date().toISOString(),
          description: 'Canal com histórias inspiradoras - dados de demonstração'
        });
      }
      
    } catch (error) {
      setError(`Erro ao extrair conteúdo: ${error.message}`);
      console.error('Erro na extração:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'inicio':
        return (
          <div className="p-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-white mb-4">
                  YouTube Script <span className="text-red-500">Composer</span>
                </h1>
                <p className="text-xl text-gray-400 mb-8">
                  A ferramenta completa para criadores de conteúdo. Gere títulos virais, crie premissas 
                  envolventes, desenvolva roteiros profissionais e analise a concorrência com 
                  <span className="text-red-500"> inteligência artificial</span>.
                </p>
                
                <div className="flex justify-center space-x-4">
                  <button 
                    onClick={() => setActiveTab('pesquisa')}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md"
                  >
                    🚀 Começar Agora
                  </button>
                  <button 
                    onClick={() => setActiveTab('titulos')}
                    className="border border-gray-600 text-gray-300 hover:bg-gray-800 px-6 py-3 rounded-md"
                  >
                    🔍 Explorar Ferramentas
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                <div className="bg-gray-800 border border-gray-700 text-center p-6 rounded-lg">
                  <div className="text-3xl font-bold text-red-500 mb-2">10K+</div>
                  <div className="text-sm text-gray-400">Títulos Gerados</div>
                </div>
                
                <div className="bg-gray-800 border border-gray-700 text-center p-6 rounded-lg">
                  <div className="text-3xl font-bold text-red-500 mb-2">2.5K+</div>
                  <div className="text-sm text-gray-400">Roteiros Criados</div>
                </div>
                
                <div className="bg-gray-800 border border-gray-700 text-center p-6 rounded-lg">
                  <div className="text-3xl font-bold text-red-500 mb-2">500+</div>
                  <div className="text-sm text-gray-400">Criadores Ativos</div>
                </div>
                
                <div className="bg-gray-800 border border-gray-700 text-center p-6 rounded-lg">
                  <div className="text-3xl font-bold text-red-500 mb-2">95%</div>
                  <div className="text-sm text-gray-400">Taxa de Sucesso</div>
                </div>
              </div>

              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-8">Ferramentas Poderosas para Criadores</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gray-800 border border-gray-700 hover:border-red-500 transition-colors cursor-pointer rounded-lg" onClick={() => setActiveTab('titulos')}>
                  <div className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <Wand2 className="h-6 w-6 text-red-500" />
                      <h3 className="text-xl font-semibold text-white">Títulos Virais</h3>
                    </div>
                    <p className="text-gray-400 mb-4">
                      Gere títulos otimizados que capturam atenção e aumentam o CTR
                    </p>
                    <button 
                      className="w-full border border-gray-600 text-gray-300 hover:bg-gray-700 py-2 px-4 rounded-md"
                      onClick={() => setActiveTab('titulos')}
                    >
                      Experimentar Agora
                    </button>
                  </div>
                </div>

                <div className="bg-gray-800 border border-gray-700 hover:border-red-500 transition-colors cursor-pointer rounded-lg" onClick={() => setActiveTab('premissas')}>
                  <div className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <Lightbulb className="h-6 w-6 text-red-500" />
                      <h3 className="text-xl font-semibold text-white">Premissas Criativas</h3>
                    </div>
                    <p className="text-gray-400 mb-4">
                      Desenvolva ideias sólidas para seus vídeos com estrutura profissional
                    </p>
                    <button 
                      className="w-full border border-gray-600 text-gray-300 hover:bg-gray-700 py-2 px-4 rounded-md"
                      onClick={() => setActiveTab('premissas')}
                    >
                      Experimentar Agora
                    </button>
                  </div>
                </div>

                <div className="bg-gray-800 border border-gray-700 hover:border-red-500 transition-colors cursor-pointer rounded-lg" onClick={() => setActiveTab('roteiros')}>
                  <div className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <BookOpen className="h-6 w-6 text-red-500" />
                      <h3 className="text-xl font-semibold text-white">Editor de Roteiros</h3>
                    </div>
                    <p className="text-gray-400 mb-4">
                      Crie e edite roteiros completos com cronometragem automática
                    </p>
                    <button 
                      className="w-full border border-gray-600 text-gray-300 hover:bg-gray-700 py-2 px-4 rounded-md"
                      onClick={() => setActiveTab('roteiros')}
                    >
                      Experimentar Agora
                    </button>
                  </div>
                </div>

                <div className="bg-gray-800 border border-gray-700 hover:border-red-500 transition-colors cursor-pointer rounded-lg" onClick={() => setActiveTab('pesquisa')}>
                  <div className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <Search className="h-6 w-6 text-red-500" />
                      <h3 className="text-xl font-semibold text-white">Análise YouTube</h3>
                    </div>
                    <p className="text-gray-400 mb-4">
                      Pesquise e analise vídeos concorrentes com IA
                    </p>
                    <button 
                      className="w-full border border-gray-600 text-gray-300 hover:bg-gray-700 py-2 px-4 rounded-md"
                      onClick={() => setActiveTab('pesquisa')}
                    >
                      Experimentar Agora
                    </button>
                  </div>
                </div>

                <div className="bg-gray-800 border border-gray-700 hover:border-red-500 transition-colors cursor-pointer rounded-lg" onClick={() => setActiveTab('audio')}>
                  <div className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <Mic className="h-6 w-6 text-red-500" />
                      <h3 className="text-xl font-semibold text-white">Gerador de Áudio</h3>
                    </div>
                    <p className="text-gray-400 mb-4">
                      Converta roteiros em áudio com vozes naturais usando IA
                    </p>
                    <button
                      className="w-full border border-gray-600 text-gray-300 hover:bg-gray-700 py-2 px-4 rounded-md"
                      onClick={() => setActiveTab('audio')}
                    >
                      Experimentar Agora
                    </button>
                  </div>
                </div>

                <div className="bg-gray-800 border border-gray-700 hover:border-red-500 transition-colors cursor-pointer rounded-lg" onClick={() => setActiveTab('imagens')}>
                  <div className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <ImageIcon className="h-6 w-6 text-red-500" />
                      <h3 className="text-xl font-semibold text-white">Gerador de Imagens</h3>
                    </div>
                    <p className="text-gray-400 mb-4">
                      Crie thumbnails e imagens personalizadas com IA
                    </p>
                    <button
                      className="w-full border border-gray-600 text-gray-300 hover:bg-gray-700 py-2 px-4 rounded-md"
                      onClick={() => setActiveTab('imagens')}
                    >
                      Experimentar Agora
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'pesquisa':
        return (
          <div className="p-8">
            <div className="max-w-6xl mx-auto">
              <div className="mb-8">
                <div className="flex items-center space-x-3 mb-4">
                  <Search className="h-8 w-8 text-red-500" />
                  <h1 className="text-3xl font-bold text-white">Menu de Ferramentas - Análise YouTube</h1>
                </div>
                <p className="text-gray-400">Extraia e analise títulos de canais do YouTube com filtros avançados</p>
              </div>

              {/* API Configuration Section */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg mb-6">
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Settings className="h-6 w-6 text-red-500" />
                    <h3 className="text-xl font-semibold text-white">Configuração da API RapidAPI YouTube V2</h3>
                  </div>
                  <p className="text-sm text-gray-400 mb-4">
                    Configure sua chave da API para scraping real de canais do YouTube
                  </p>
                  <div className="space-y-4">
                    <div className="relative">
                      <input
                        type={showApiKeys['rapidapi_youtube'] ? "text" : "password"}
                        placeholder="Cole sua chave RapidAPI YouTube V2 aqui..."
                        className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-md pr-10"
                        value={apiKeys['rapidapi_youtube'] || ''}
                        onChange={(e) => {
                          setApiKeys(prev => ({...prev, 'rapidapi_youtube': e.target.value}));
                        }}
                        onBlur={(e) => {
                          if (e.target.value.trim()) {
                            updateApiConfig('rapidapi_youtube', e.target.value.trim());
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowApiKeys(prev => ({...prev, 'rapidapi_youtube': !prev['rapidapi_youtube']}))}
                      >
                        {showApiKeys['rapidapi_youtube'] ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    
                    {apiValidation['rapidapi_youtube'] && (
                      <div className="flex items-center space-x-2">
                        {apiValidation['rapidapi_youtube'] === 'validating' && (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
                            <span className="text-yellow-500 text-sm">Validando chave...</span>
                          </>
                        )}
                        {apiValidation['rapidapi_youtube'] === 'valid' && (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-green-500 text-sm">Chave válida! Scraping real ativado</span>
                          </>
                        )}
                        {apiValidation['rapidapi_youtube'] === 'invalid' && (
                          <>
                            <AlertCircle className="h-4 w-4 text-red-500" />
                            <span className="text-red-500 text-sm">Chave inválida</span>
                          </>
                        )}
                      </div>
                    )}
                    
                    <div className="bg-blue-900 border border-blue-700 rounded-lg p-4">
                      <p className="text-sm text-blue-200">
                        💡 <strong>Sem API key:</strong> Dados de demonstração serão exibidos<br/>
                        🔑 <strong>Com API key:</strong> Scraping real de canais do YouTube será realizado
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Channel URL and Filters Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* URL Input */}
                <div className="bg-gray-800 border border-gray-700 rounded-lg">
                  <div className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <Link className="h-6 w-6 text-red-500" />
                      <h3 className="text-xl font-semibold text-white">URL ou ID do Canal</h3>
                    </div>
                    <div className="space-y-4">
                      <input
                        placeholder="Ex: @NomeDoCanal, URL completa ou ID do canal (UCxxxxxxxxx)"
                        className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-md"
                        value={projectData.youtubeUrl}
                        onChange={(e) => setProjectData({...projectData, youtubeUrl: e.target.value})}
                      />
                      <div className="text-sm text-gray-400">
                        <p>📌 Formatos aceitos:</p>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          <li><strong>URL completa:</strong> https://www.youtube.com/@NomeDoCanal</li>
                          <li><strong>Handle:</strong> @NomeDoCanal</li>
                          <li><strong>Nome direto:</strong> NomeDoCanal</li>
                          <li><strong>ID do canal:</strong> UCxxxxxxxxxxxxxxxxxx (24 caracteres)</li>
                          <li><strong>URL antiga:</strong> https://www.youtube.com/c/NomeDoCanal</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Advanced Filters */}
                <div className="bg-gray-800 border border-gray-700 rounded-lg">
                  <div className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <Filter className="h-6 w-6 text-red-500" />
                      <h3 className="text-xl font-semibold text-white">Filtros Avançados</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
                            <TrendingUp className="h-4 w-4" />
                            <span>Visualizações Mínimas</span>
                          </label>
                          <input
                            type="number"
                            placeholder="1000"
                            className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-md"
                            value={extractionConfig.minViews}
                            onChange={(e) => setExtractionConfig({...extractionConfig, minViews: parseInt(e.target.value) || 0})}
                          />
                        </div>
                        
                        <div>
                          <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
                            <BarChart3 className="h-4 w-4" />
                            <span>Número de Títulos</span>
                          </label>
                          <input
                            type="number"
                            placeholder="3"
                            className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-md"
                            value={extractionConfig.maxTitles}
                            onChange={(e) => setExtractionConfig({...extractionConfig, maxTitles: parseInt(e.target.value) || 1})}
                          />
                        </div>
                        
                        <div>
                          <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
                            <Calendar className="h-4 w-4" />
                            <span>Últimos (dias)</span>
                          </label>
                          <input
                            type="number"
                            placeholder="3"
                            className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-md"
                            value={extractionConfig.daysPeriod}
                            onChange={(e) => setExtractionConfig({...extractionConfig, daysPeriod: parseInt(e.target.value) || 1})}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filter Summary */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg mb-6">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-300">
                      <span className="font-medium">Filtros ativos:</span> {extractionConfig.maxTitles} títulos acima de {extractionConfig.minViews.toLocaleString()} visualizações nos últimos {extractionConfig.daysPeriod} dias
                    </div>
                    <button
                      onClick={extractYouTubeContent}
                      disabled={loading || !projectData.youtubeUrl.trim()}
                      className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 px-6 rounded-md flex items-center"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Analisando...
                        </>
                      ) : (
                        <>
                          <Search className="h-4 w-4 mr-2" />
                          🚀 Extrair Títulos
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mb-6 bg-red-900 border border-red-700 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <span className="text-red-200">{error}</span>
                  </div>
                </div>
              )}

              {extractedTitles.length > 0 && (
                <div className="bg-gray-800 border border-gray-700 rounded-lg">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-2">🎯 Títulos Extraídos ({extractedTitles.length})</h3>
                        <p className="text-sm text-gray-400">Análise dos títulos mais performáticos baseada nos seus filtros</p>
                      </div>
                      {videoData && (
                        <div className="text-right">
                          <p className="text-sm text-gray-400">Canal: <span className="text-white">{videoData.originalTitle}</span></p>
                          <p className="text-xs text-gray-500">Dados extraídos em {new Date().toLocaleString('pt-BR')}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      {extractedTitles.map((titleData, index) => (
                        <div
                          key={titleData.id}
                          className="p-4 bg-gray-700 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-semibold text-white mb-2 flex-1">{titleData.title}</h4>
                            <div className="text-xs text-gray-400 ml-4">
                              {titleData.publishedAt && new Date(titleData.publishedAt).toLocaleDateString('pt-BR')}
                            </div>
                          </div>
                          <p className="text-sm text-gray-400 mb-3">{titleData.summary}</p>
                          <div className="flex items-center space-x-4 text-xs">
                            <span className="bg-green-800 text-green-200 px-2 py-1 rounded">
                              Score: {titleData.score}/100
                            </span>
                            <span className="bg-blue-800 text-blue-200 px-2 py-1 rounded">
                              CTR: {titleData.clickThroughRate}
                            </span>
                            <span className="bg-purple-800 text-purple-200 px-2 py-1 rounded">
                              👁️ {titleData.estimatedViews.toLocaleString()} views
                            </span>
                            {titleData.videoId && (
                              <span className="bg-gray-600 text-gray-200 px-2 py-1 rounded">
                                ID: {titleData.videoId}
                              </span>
                            )}
                          </div>
                          <div className="mt-4">
                            <div className="flex items-center space-x-2">
                              <select
                                value={selectedSummaryAgent}
                                onChange={(e) => setSelectedSummaryAgent(e.target.value)}
                                className="bg-gray-600 border border-gray-500 text-white px-2 py-1 rounded-md text-xs"
                              >
                                <option value="gemini">Gemini</option>
                                <option value="chatgpt">ChatGPT</option>
                                <option value="claude">Claude</option>
                                <option value="openrouter">OpenRouter</option>
                              </select>
                              <button
                                onClick={() => generateSummary(titleData.videoId, titleData.title)}
                                className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded-md text-xs flex items-center"
                              >
                                <Wand2 className="h-3 w-3 mr-1" />
                                Gerar Resumo
                              </button>
                            </div>
                            {generatedSummaries[titleData.videoId] && (
                              <div className="mt-2 bg-gray-600 p-2 rounded">
                                <p className="text-xs text-gray-300 whitespace-pre-wrap">
                                  {generatedSummaries[titleData.videoId]}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'titulos':
        return (
          <div className="p-8">
            <div className="max-w-6xl mx-auto">
              <div className="mb-8">
                <div className="flex items-center space-x-3 mb-4">
                  <Wand2 className="h-8 w-8 text-red-500" />
                  <h1 className="text-3xl font-bold text-white">Gerador de Títulos Virais com IA</h1>
                </div>
                <p className="text-gray-400">Use IA para criar títulos otimizados baseados nos títulos extraídos da pesquisa</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Configuração e Importação */}
                <div className="space-y-6">
                  {/* Importar Títulos */}
                  <div className="bg-gray-800 border border-gray-700 rounded-lg">
                    <div className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <Plus className="h-6 w-6 text-blue-500" />
                        <h3 className="text-xl font-semibold text-white">Importar Títulos da Pesquisa</h3>
                      </div>
                      <p className="text-sm text-gray-400 mb-4">
                        Importe os títulos extraídos na página de Pesquisa para usar como base
                      </p>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={importTitlesFromSearch}
                          disabled={extractedTitles.length === 0}
                          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 px-4 rounded-md flex items-center"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Importar {extractedTitles.length} Títulos
                        </button>
                        <span className="text-sm text-gray-400">
                          {extractedTitles.length === 0 ? 'Nenhum título disponível' : `${extractedTitles.length} títulos disponíveis`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Configuração da IA */}
                  <div className="bg-gray-800 border border-gray-700 rounded-lg">
                    <div className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <Bot className="h-6 w-6 text-purple-500" />
                        <h3 className="text-xl font-semibold text-white">Configuração da IA</h3>
                      </div>
                      
                      <div className="space-y-4">
                        {/* Seleção do Agente */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Agente de IA
                          </label>
                          <select
                            value={selectedAiAgent}
                            onChange={(e) => setSelectedAiAgent(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-md"
                          >
                            <option value="gemini">Google Gemini</option>
                            <option value="chatgpt">OpenAI ChatGPT</option>
                            <option value="claude">Anthropic Claude</option>
                            <option value="openrouter">OpenRouter</option>
                          </select>
                          <div className="mt-2 flex items-center space-x-2">
                            {apiValidation[selectedAiAgent === 'chatgpt' ? 'openai' : selectedAiAgent] === 'valid' ? (
                              <>
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span className="text-green-500 text-sm">API configurada</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="h-4 w-4 text-red-500" />
                                <span className="text-red-500 text-sm">Configure a API nas Configurações</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Instruções para a IA */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Instruções para a IA
                          </label>
                          <textarea
                            value={aiInstructions}
                            onChange={(e) => setAiInstructions(e.target.value)}
                            placeholder="Descreva como a IA deve criar os novos títulos..."
                            className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-md h-24 resize-none"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Seja específico sobre o tom, estilo e características que deseja nos títulos
                          </p>
                        </div>

                        {/* Botão de Gerar */}
                        <button
                          onClick={generateTitlesWithAI}
                          disabled={isGeneratingTitles || importedTitles.length === 0 || !apiKeys[selectedAiAgent === 'chatgpt' ? 'openai' : selectedAiAgent]}
                          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 px-4 rounded-md flex items-center justify-center"
                        >
                          {isGeneratingTitles ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Gerando Títulos...
                            </>
                          ) : (
                            <>
                              <Wand2 className="h-4 w-4 mr-2" />
                              🚀 Gerar Títulos com IA
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Títulos Importados */}
                  {importedTitles.length > 0 && (
                    <div className="bg-gray-800 border border-gray-700 rounded-lg">
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-6 w-6 text-green-500" />
                            <h3 className="text-xl font-semibold text-white">Títulos Importados ({importedTitles.length})</h3>
                          </div>
                          <button
                            onClick={() => setImportedTitles([])}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            Limpar Todos
                          </button>
                        </div>
                        
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {importedTitles.map((title) => (
                            <div key={title.id} className="flex items-center justify-between bg-gray-700 p-3 rounded-lg">
                              <div className="flex-1">
                                <p className="text-white text-sm">{title.title}</p>
                                <p className="text-xs text-gray-400">{title.views?.toLocaleString()} visualizações</p>
                              </div>
                              <button
                                onClick={() => removeImportedTitle(title.id)}
                                className="text-red-400 hover:text-red-300 ml-2"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Títulos Gerados */}
                <div>
                  <div className="bg-gray-800 border border-gray-700 rounded-lg">
                    <div className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <Lightbulb className="h-6 w-6 text-yellow-500" />
                        <h3 className="text-xl font-semibold text-white">Títulos Gerados pela IA</h3>
                      </div>
                      
                      {titleGenerationError && (
                        <div className="mb-4 bg-red-900 border border-red-700 rounded-lg p-4">
                          <div className="flex items-center">
                            <AlertCircle className="h-4 w-4 mr-2 text-red-400" />
                            <span className="text-red-200">{titleGenerationError}</span>
                          </div>
                        </div>
                      )}

                      {generatedTitles.length === 0 ? (
                        <div className="text-center py-12">
                          <Bot className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                          <p className="text-gray-400 mb-2">Nenhum título gerado ainda</p>
                          <p className="text-sm text-gray-500">
                            Importe títulos da pesquisa e configure a IA para começar
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                          {generatedTitles.map((title, index) => (
                            <div key={title.id} className="bg-gray-700 rounded-lg p-4">
                              <div className="flex items-start justify-between mb-3">
                                <h4 className="font-semibold text-white flex-1 pr-4">{title.title}</h4>
                                <button
                                  onClick={() => copyGeneratedTitle(title.title)}
                                  className="text-blue-400 hover:text-blue-300 flex-shrink-0"
                                  title="Copiar título"
                                >
                                  <Copy className="h-4 w-4" />
                                </button>
                              </div>
                              <div className="flex items-center space-x-4 text-xs">
                                <span className="bg-purple-800 text-purple-200 px-2 py-1 rounded">
                                  {title.agent.toUpperCase()}
                                </span>
                                <span className="bg-green-800 text-green-200 px-2 py-1 rounded">
                                  Score: {title.score}/100
                                </span>
                                <span className="bg-blue-800 text-blue-200 px-2 py-1 rounded">
                                  CTR Est: {title.estimated_ctr}
                                </span>
                                <span className="text-gray-400">
                                  {new Date(title.generated_at).toLocaleString('pt-BR')}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'premissas':
        return (
          <div className="p-8">
            <div className="max-w-6xl mx-auto">
              <div className="mb-8">
                <div className="flex items-center space-x-3 mb-4">
                  <Lightbulb className="h-8 w-8 text-red-500" />
                  <h1 className="text-3xl font-bold text-white">Gerador de Premissas Narrativas com IA</h1>
                </div>
                <p className="text-gray-400">Crie premissas envolventes baseadas em títulos usando inteligência artificial</p>

                {/* Instruções de uso */}
                {(generatedTitles.length === 0 && importedTitles.length === 0) && (
                  <div className="mt-4 p-4 bg-blue-900/30 border border-blue-700 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5" />
                      <div>
                        <h4 className="text-blue-300 font-medium mb-2">Como usar:</h4>
                        <ol className="text-sm text-blue-200 space-y-1">
                          <li>1. Vá para a página <strong>Títulos</strong> e gere alguns títulos com IA</li>
                          <li>2. Volte aqui e clique em <strong>Importar Título</strong></li>
                          <li>3. Configure a IA e personalize o prompt se necessário</li>
                          <li>4. Clique em <strong>Gerar Premissa com IA</strong></li>
                        </ol>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Configuração da Premissa */}
                <div className="space-y-6">
                  {/* Importar Título */}
                  <div className="bg-gray-800 border border-gray-700 rounded-lg">
                    <div className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <Plus className="h-6 w-6 text-blue-500" />
                        <h3 className="text-xl font-semibold text-white">Importar Título</h3>
                      </div>
                      <p className="text-sm text-gray-400 mb-4">
                        Importe um título gerado na página de Títulos para usar como base
                      </p>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={importTitleToPremise}
                          disabled={generatedTitles.length === 0 && importedTitles.length === 0}
                          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 px-4 rounded-md flex items-center"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Importar Título
                        </button>
                        <span className="text-sm text-gray-400">
                          {generatedTitles.length > 0 ? `${generatedTitles.length} títulos gerados disponíveis` :
                           importedTitles.length > 0 ? `${importedTitles.length} títulos importados disponíveis` :
                           'Nenhum título disponível - Vá para a página Títulos primeiro'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Informações da Premissa */}
                  <div className="bg-gray-800 border border-gray-700 rounded-lg">
                    <div className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <FileText className="h-6 w-6 text-green-500" />
                        <h3 className="text-xl font-semibold text-white">Informações da Premissa</h3>
                      </div>

                      <div className="space-y-4">
                        {/* Título */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Título *
                          </label>
                          <input
                            type="text"
                            value={premiseTitle}
                            onChange={(e) => setPremiseTitle(e.target.value)}
                            placeholder="Digite o título para gerar a premissa"
                            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          />
                        </div>

                        {/* Resumo */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Resumo (Opcional)
                          </label>
                          <textarea
                            value={premiseResume}
                            onChange={(e) => setPremiseResume(e.target.value)}
                            placeholder="Digite um resumo adicional para contextualizar a premissa"
                            rows={3}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Configuração da IA */}
                  <div className="bg-gray-800 border border-gray-700 rounded-lg">
                    <div className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <Bot className="h-6 w-6 text-purple-500" />
                        <h3 className="text-xl font-semibold text-white">Configuração da IA</h3>
                      </div>

                      <div className="space-y-4">
                        {/* Seleção do Agente */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Agente de IA
                          </label>
                          <select
                            value={selectedPremiseAgent}
                            onChange={(e) => setSelectedPremiseAgent(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          >
                            <option value="gemini">Google Gemini</option>
                            <option value="chatgpt">ChatGPT (OpenAI)</option>
                            <option value="claude">Claude (Anthropic)</option>
                            <option value="openrouter">OpenRouter</option>
                          </select>
                        </div>

                        {/* Status da API */}
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            {apiValidation[selectedPremiseAgent === 'chatgpt' ? 'openai' : selectedPremiseAgent] === 'valid' ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : apiValidation[selectedPremiseAgent === 'chatgpt' ? 'openai' : selectedPremiseAgent] === 'invalid' ? (
                              <AlertCircle className="h-4 w-4 text-red-500" />
                            ) : (
                              <Cog className="h-4 w-4 text-gray-500" />
                            )}
                            <span className="ml-2 text-sm text-gray-400">
                              {apiValidation[selectedPremiseAgent === 'chatgpt' ? 'openai' : selectedPremiseAgent] === 'valid' ? 'API Configurada' :
                               apiValidation[selectedPremiseAgent === 'chatgpt' ? 'openai' : selectedPremiseAgent] === 'invalid' ? 'API com Erro' :
                               'API Não Configurada'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Prompt do Agente */}
                  <div className="bg-gray-800 border border-gray-700 rounded-lg">
                    <div className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <Wand2 className="h-6 w-6 text-yellow-500" />
                        <h3 className="text-xl font-semibold text-white">Prompt do Agente</h3>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Instruções para a IA
                        </label>
                        <textarea
                          value={premiseAgentPrompt}
                          onChange={(e) => setPremiseAgentPrompt(e.target.value)}
                          placeholder="Digite as instruções para o agente de IA"
                          rows={8}
                          className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none text-sm"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          Este prompt define como a IA deve processar o título e gerar a premissa narrativa
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Botão de Geração */}
                  <div className="bg-gray-800 border border-gray-700 rounded-lg">
                    <div className="p-6">
                      <button
                        onClick={generatePremiseWithAI}
                        disabled={isGeneratingPremise || !premiseTitle.trim() || !apiKeys[selectedPremiseAgent === 'chatgpt' ? 'openai' : selectedPremiseAgent]}
                        className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 px-6 rounded-md flex items-center justify-center text-lg font-semibold"
                      >
                        {isGeneratingPremise ? (
                          <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Gerando Premissa...
                          </>
                        ) : (
                          <>
                            <Lightbulb className="h-5 w-5 mr-2" />
                            Gerar Premissa com IA
                          </>
                        )}
                      </button>

                      {premiseGenerationError && (
                        <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded-md">
                          <div className="flex items-center">
                            <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                            <span className="text-red-300 text-sm">{premiseGenerationError}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Resultado da Premissa */}
                <div className="space-y-6">
                  <div className="bg-gray-800 border border-gray-700 rounded-lg">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <Eye className="h-6 w-6 text-green-500" />
                          <h3 className="text-xl font-semibold text-white">Premissa Gerada</h3>
                        </div>
                        {generatedPremise && (
                          <button
                            onClick={() => navigator.clipboard.writeText(generatedPremise)}
                            className="bg-gray-700 hover:bg-gray-600 text-white py-1 px-3 rounded-md flex items-center text-sm"
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            Copiar
                          </button>
                        )}
                      </div>

                      {!generatedPremise ? (
                        <div className="text-center py-12">
                          <Lightbulb className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                          <p className="text-gray-400 mb-2">Nenhuma premissa gerada ainda</p>
                          <p className="text-sm text-gray-500">
                            Preencha o título e configure a IA para começar
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="bg-gray-700 rounded-lg p-4">
                            <div className="text-white leading-relaxed whitespace-pre-wrap">
                              {generatedPremise}
                            </div>
                          </div>

                          {/* Estatísticas da Premissa */}
                          <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="bg-gray-700 rounded-lg p-3">
                              <div className="text-2xl font-bold text-blue-500">
                                {generatedPremise.split(' ').length}
                              </div>
                              <div className="text-sm text-gray-400">Palavras</div>
                            </div>
                            <div className="bg-gray-700 rounded-lg p-3">
                              <div className="text-2xl font-bold text-green-500">
                                {generatedPremise.length}
                              </div>
                              <div className="text-sm text-gray-400">Caracteres</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'roteiros':
        return (
          <div className="p-8">
            <div className="max-w-6xl mx-auto">
              <div className="mb-8">
                <div className="flex items-center space-x-3 mb-4">
                  <BookOpen className="h-8 w-8 text-red-500" />
                  <h1 className="text-3xl font-bold text-white">Gerador de Roteiros com IA</h1>
                </div>
                <p className="text-gray-400">Crie roteiros completos com múltiplos capítulos usando inteligência artificial</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Configuração do Roteiro */}
                <div className="space-y-6">
                  {/* Informações Básicas */}
                  <div className="bg-gray-800 border border-gray-700 rounded-lg">
                    <div className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <FileText className="h-6 w-6 text-blue-500" />
                        <h3 className="text-xl font-semibold text-white">Informações do Roteiro</h3>
                      </div>
                      
                      <div className="space-y-4">
                        {/* Título */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Título do Roteiro *
                          </label>
                          <input
                            type="text"
                            value={scriptTitle}
                            onChange={(e) => setScriptTitle(e.target.value)}
                            placeholder="Ex: A História Incrível de Superação que Mudou Tudo"
                            className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-md"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Este será o tema central do seu roteiro
                          </p>
                        </div>

                        {/* Contexto */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Contexto/Premissa
                          </label>
                          <textarea
                            value={scriptContext}
                            onChange={(e) => setScriptContext(e.target.value)}
                            placeholder="Descreva o contexto, personagens principais, cenário ou qualquer informação adicional que ajude a IA a criar um roteiro mais rico..."
                            className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-md h-24 resize-none"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Opcional: Forneça detalhes para enriquecer a narrativa
                          </p>
                        </div>

                        {/* Número de Capítulos */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Número de Capítulos
                          </label>
                          <input
                            type="number"
                            min="3"
                            max="20"
                            value={numChapters}
                            onChange={(e) => setNumChapters(parseInt(e.target.value) || 10)}
                            className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-md"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Cada capítulo terá aproximadamente 500 palavras
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Configuração da IA */}
                  <div className="bg-gray-800 border border-gray-700 rounded-lg">
                    <div className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <Bot className="h-6 w-6 text-purple-500" />
                        <h3 className="text-xl font-semibold text-white">Agente de IA</h3>
                      </div>
                      
                      <div className="space-y-4">
                        {/* Seleção do Agente */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Escolha o Agente de IA
                          </label>
                          <select
                            value={selectedScriptAgent}
                            onChange={(e) => setSelectedScriptAgent(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-md"
                          >
                            <option value="chatgpt">OpenAI ChatGPT (GPT-4o-mini)</option>
                            <option value="claude">Anthropic Claude (Sonnet)</option>
                            <option value="gemini">Google Gemini (1.5-Flash)</option>
                            <option value="openrouter">OpenRouter (Claude-3-Sonnet)</option>
                          </select>
                          <div className="mt-2 flex items-center space-x-2">
                            {apiValidation[selectedScriptAgent === 'chatgpt' ? 'openai' : selectedScriptAgent] === 'valid' ? (
                              <>
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span className="text-green-500 text-sm">API configurada</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="h-4 w-4 text-red-500" />
                                <span className="text-red-500 text-sm">Configure a API nas Configurações</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Botão de Gerar */}
                        <button
                          onClick={generateScriptWithAI}
                          disabled={isGeneratingScript || !scriptTitle.trim() || !apiKeys[selectedScriptAgent === 'chatgpt' ? 'openai' : selectedScriptAgent]}
                          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 px-4 rounded-md flex items-center justify-center"
                        >
                          {isGeneratingScript ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Gerando Roteiro... ({numChapters} capítulos)
                            </>
                          ) : (
                            <>
                              <BookOpen className="h-4 w-4 mr-2" />
                              🚀 Gerar Roteiro Completo
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Estatísticas do Roteiro */}
                  {generatedScript && (
                    <div className="bg-gray-800 border border-gray-700 rounded-lg">
                      <div className="p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <BarChart3 className="h-6 w-6 text-green-500" />
                          <h3 className="text-xl font-semibold text-white">Estatísticas</h3>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-700 rounded-lg p-3">
                            <div className="text-2xl font-bold text-blue-500 mb-1">
                              {generatedScript.total_chapters}
                            </div>
                            <div className="text-sm text-gray-400">Capítulos</div>
                          </div>
                          <div className="bg-gray-700 rounded-lg p-3">
                            <div className="text-2xl font-bold text-green-500 mb-1">
                              {generatedScript.total_words?.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-400">Palavras</div>
                          </div>
                          <div className="bg-gray-700 rounded-lg p-3">
                            <div className="text-2xl font-bold text-purple-500 mb-1">
                              {generatedScript.agent}
                            </div>
                            <div className="text-sm text-gray-400">Agente IA</div>
                          </div>
                          <div className="bg-gray-700 rounded-lg p-3">
                            <div className="text-2xl font-bold text-yellow-500 mb-1">
                              {Math.ceil(generatedScript.total_words / 150)}min
                            </div>
                            <div className="text-sm text-gray-400">Duração Est.</div>
                          </div>
                        </div>

                        <button
                          onClick={exportScript}
                          className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md flex items-center justify-center"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Exportar Roteiro Completo
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Roteiro Gerado */}
                <div>
                  <div className="bg-gray-800 border border-gray-700 rounded-lg">
                    <div className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <Mic className="h-6 w-6 text-yellow-500" />
                        <h3 className="text-xl font-semibold text-white">Roteiro Gerado</h3>
                      </div>
                      
                      {scriptGenerationError && (
                        <div className="mb-4 bg-red-900 border border-red-700 rounded-lg p-4">
                          <div className="flex items-center">
                            <AlertCircle className="h-4 w-4 mr-2 text-red-400" />
                            <span className="text-red-200">{scriptGenerationError}</span>
                          </div>
                        </div>
                      )}

                      {!generatedScript ? (
                        <div className="text-center py-12">
                          <BookOpen className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                          <p className="text-gray-400 mb-2">Nenhum roteiro gerado ainda</p>
                          <p className="text-sm text-gray-500">
                            Preencha o título e configure a IA para começar
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                          {generatedScript.chapters.map((chapter, index) => (
                            <div key={chapter.chapter_number} className="bg-gray-700 rounded-lg p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-white mb-2">
                                    Capítulo {chapter.chapter_number}
                                  </h4>
                                  <div className="text-xs text-gray-400 mb-3">
                                    {chapter.word_count} palavras • ~{Math.ceil(chapter.word_count / 150)} min de leitura
                                  </div>
                                </div>
                                <button
                                  onClick={() => copyChapter(chapter.content)}
                                  className="text-blue-400 hover:text-blue-300 flex-shrink-0"
                                  title="Copiar capítulo"
                                >
                                  <Copy className="h-4 w-4" />
                                </button>
                              </div>
                              <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                                {chapter.content.length > 300 ? (
                                  <details className="cursor-pointer">
                                    <summary className="text-blue-400 hover:text-blue-300 mb-2">
                                      {chapter.content.substring(0, 300)}... (clique para ver mais)
                                    </summary>
                                    {chapter.content}
                                  </details>
                                ) : (
                                  chapter.content
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'audio-test':
        return (
          <div className="p-8">
            <div className="max-w-6xl mx-auto">
              <div className="mb-8">
                <div className="flex items-center space-x-3 mb-4">
                  <TestTube className="h-8 w-8 text-blue-500" />
                  <h1 className="text-3xl font-bold text-white">Teste de APIs de Áudio</h1>
                </div>
                <p className="text-gray-400">Teste diferentes serviços de TTS para verificar funcionamento e qualidade</p>
              </div>

              {/* Teste Gemini TTS */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg mb-6">
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <h3 className="text-xl font-semibold text-white">Google Gemini TTS</h3>
                    <span className="bg-green-600 text-white px-2 py-1 rounded text-xs">NOVO</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Texto para Teste
                      </label>
                      <textarea
                        value="Olá! Este é um teste do Google Gemini TTS. Como você pode ouvir, a qualidade da voz é muito natural e expressiva."
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        rows="3"
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Voz
                      </label>
                      <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500">
                        <option value="Puck">Puck (Masculina)</option>
                        <option value="Charon">Charon (Masculina)</option>
                        <option value="Kore">Kore (Feminina)</option>
                        <option value="Fenrir">Fenrir (Masculina)</option>
                        <option value="Aoede">Aoede (Feminina)</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4 flex space-x-4">
                    <button
                      onClick={() => testTTSService('gemini', 'Puck', 'Olá! Este é um teste do Google Gemini TTS com 5 vozes diferentes disponíveis.')}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center disabled:opacity-50"
                      disabled={testingService === 'gemini'}
                    >
                      {testingService === 'gemini' ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Play className="h-4 w-4 mr-2" />
                      )}
                      {testingService === 'gemini' ? 'Testando...' : 'Testar Gemini TTS'}
                    </button>
                    <button
                      onClick={() => setActiveTab('audio-apis')}
                      className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-md flex items-center"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Configurar API
                    </button>
                  </div>

                  <div className="mt-4 p-3 bg-blue-900/30 border border-blue-700 rounded-md">
                    <p className="text-blue-200 text-sm">
                      <strong>Status:</strong> {apiKeys.gemini ? '✅ API configurada' : '❌ API não configurada - Configure na aba "Configurar APIs"'}
                    </p>
                  </div>

                  {testResults.gemini && (
                    <div className={`mt-4 p-3 rounded-md border ${testResults.gemini.success ? 'bg-green-900/30 border-green-700' : 'bg-red-900/30 border-red-700'}`}>
                      <p className={`text-sm ${testResults.gemini.success ? 'text-green-200' : 'text-red-200'}`}>
                        <strong>Resultado do Teste:</strong> {testResults.gemini.success ? '✅ Sucesso!' : '❌ Erro'}
                      </p>
                      {testResults.gemini.success ? (
                        <div className="mt-2">
                          <p className="text-green-200 text-sm">🎵 Áudio gerado com sucesso!</p>
                          <p className="text-green-200 text-sm">⏱️ Duração: {testResults.gemini.duration}</p>
                          {testResults.gemini.audio_url && (
                            <audio controls className="mt-2 w-full">
                              <source src={`http://localhost:5000${testResults.gemini.audio_url}`} type="audio/mpeg" />
                            </audio>
                          )}
                        </div>
                      ) : (
                        <p className="text-red-200 text-sm mt-1">{testResults.gemini.error}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Teste Chatterbox */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg mb-6">
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <h3 className="text-xl font-semibold text-white">Chatterbox TTS</h3>
                    <span className="bg-orange-600 text-white px-2 py-1 rounded text-xs">OPEN SOURCE</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Texto para Teste
                      </label>
                      <textarea
                        value="Olá! Este é um teste do Chatterbox TTS. Este sistema permite controle avançado de emoção e expressividade na voz."
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        rows="3"
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Estilo de Voz
                      </label>
                      <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500">
                        <option value="default">Voz Padrão</option>
                        <option value="expressive">Voz Expressiva</option>
                        <option value="calm">Voz Calma</option>
                        <option value="energetic">Voz Energética</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4 flex space-x-4">
                    <button
                      onClick={() => testTTSService('chatterbox', 'expressive', 'Olá! Este é um teste do Chatterbox TTS. Este sistema permite controle avançado de emoção e expressividade na voz.')}
                      className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md flex items-center disabled:opacity-50"
                      disabled={testingService === 'chatterbox'}
                    >
                      {testingService === 'chatterbox' ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Play className="h-4 w-4 mr-2" />
                      )}
                      {testingService === 'chatterbox' ? 'Testando...' : 'Testar Chatterbox'}
                    </button>
                    <button className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-md flex items-center">
                      <Download className="h-4 w-4 mr-2" />
                      Guia de Instalação
                    </button>
                  </div>

                  <div className="mt-4 p-3 bg-orange-900/30 border border-orange-700 rounded-md">
                    <p className="text-orange-200 text-sm">
                      <strong>Status:</strong> 🔄 Verificando instalação... (Requer instalação local)
                    </p>
                  </div>

                  {testResults.chatterbox && (
                    <div className={`mt-4 p-3 rounded-md border ${testResults.chatterbox.success ? 'bg-green-900/30 border-green-700' : 'bg-red-900/30 border-red-700'}`}>
                      <p className={`text-sm ${testResults.chatterbox.success ? 'text-green-200' : 'text-red-200'}`}>
                        <strong>Resultado do Teste:</strong> {testResults.chatterbox.success ? '✅ Sucesso!' : '❌ Erro'}
                      </p>
                      {testResults.chatterbox.success ? (
                        <div className="mt-2">
                          <p className="text-green-200 text-sm">🎵 Áudio gerado com sucesso!</p>
                          <p className="text-green-200 text-sm">⏱️ Duração: {testResults.chatterbox.duration}</p>
                          {testResults.chatterbox.audio_url && (
                            <audio controls className="mt-2 w-full">
                              <source src={`http://localhost:5000${testResults.chatterbox.audio_url}`} type="audio/mpeg" />
                            </audio>
                          )}
                        </div>
                      ) : (
                        <p className="text-red-200 text-sm mt-1">{testResults.chatterbox.error}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Teste OpenAI TTS */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg mb-6">
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                    <h3 className="text-xl font-semibold text-white">OpenAI TTS</h3>
                    <span className="bg-cyan-600 text-white px-2 py-1 rounded text-xs">CHATGPT</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Texto para Teste
                      </label>
                      <textarea
                        value="Olá! Este é um teste do OpenAI TTS. Mesma tecnologia do ChatGPT com 6 vozes de alta qualidade disponíveis."
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        rows="3"
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Voz
                      </label>
                      <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500">
                        <option value="alloy">Alloy (Neutro)</option>
                        <option value="echo">Echo (Masculina)</option>
                        <option value="fable">Fable (Feminina)</option>
                        <option value="onyx">Onyx (Masculina)</option>
                        <option value="nova">Nova (Feminina)</option>
                        <option value="shimmer">Shimmer (Feminina)</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4 flex space-x-4">
                    <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-md flex items-center">
                      <Play className="h-4 w-4 mr-2" />
                      Testar OpenAI TTS
                    </button>
                    <button
                      onClick={() => setActiveTab('audio-apis')}
                      className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-md flex items-center"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Configurar API
                    </button>
                  </div>

                  <div className="mt-4 p-3 bg-cyan-900/30 border border-cyan-700 rounded-md">
                    <p className="text-cyan-200 text-sm">
                      <strong>Status:</strong> {apiKeys.openai ? '✅ API configurada' : '❌ API não configurada - Configure na aba "Configurar APIs"'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Teste Kokoro TTS */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg mb-6">
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                    <h3 className="text-xl font-semibold text-white">Kokoro TTS</h3>
                    <span className="bg-pink-600 text-white px-2 py-1 rounded text-xs">MULTILÍNGUE</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Texto para Teste
                      </label>
                      <textarea
                        value="Olá! Este é um teste do Kokoro TTS. Sistema open source que suporta mais de 100 idiomas diferentes."
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        rows="3"
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Idioma
                      </label>
                      <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-pink-500">
                        <option value="pt">Português (Recomendado)</option>
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                        <option value="de">Deutsch</option>
                        <option value="it">Italiano</option>
                        <option value="ja">Japanese</option>
                        <option value="ko">Korean</option>
                        <option value="zh">Chinese</option>
                        <option value="ru">Russian</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4 flex space-x-4">
                    <button className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-md flex items-center">
                      <Play className="h-4 w-4 mr-2" />
                      Testar Kokoro TTS
                    </button>
                    <button className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-md flex items-center">
                      <Download className="h-4 w-4 mr-2" />
                      Guia de Instalação
                    </button>
                  </div>

                  <div className="mt-4 p-3 bg-pink-900/30 border border-pink-700 rounded-md">
                    <p className="text-pink-200 text-sm">
                      <strong>Status:</strong> 🔄 Verificando instalação... (Requer instalação local)
                    </p>
                  </div>
                </div>
              </div>

              {/* Teste Edge TTS */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg">
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <h3 className="text-xl font-semibold text-white">Microsoft Edge TTS</h3>
                    <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">GRATUITO</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Texto para Teste
                      </label>
                      <textarea
                        value="Olá! Este é um teste do Microsoft Edge TTS. É um serviço gratuito e funciona imediatamente sem configuração."
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows="3"
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Voz
                      </label>
                      <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="pt-BR-AntonioNeural">Antonio (Masculina)</option>
                        <option value="pt-BR-FranciscaNeural">Francisca (Feminina)</option>
                        <option value="pt-BR-BrendaNeural">Brenda (Feminina)</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4 flex space-x-4">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center">
                      <Play className="h-4 w-4 mr-2" />
                      Testar Edge TTS
                    </button>
                  </div>

                  <div className="mt-4 p-3 bg-green-900/30 border border-green-700 rounded-md">
                    <p className="text-green-200 text-sm">
                      <strong>Status:</strong> ✅ Sempre disponível (sem configuração necessária)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'audio-apis':
        return (
          <div className="p-8">
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <div className="flex items-center space-x-3 mb-4">
                  <Settings className="h-8 w-8 text-purple-500" />
                  <h1 className="text-3xl font-bold text-white">Configuração de APIs de Áudio</h1>
                </div>
                <p className="text-gray-400">Configure as chaves de API para diferentes serviços de TTS</p>
              </div>

              {/* Configuração Gemini */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg mb-6">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${apiKeys.gemini ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <h3 className="text-xl font-semibold text-white">Google Gemini TTS</h3>
                    </div>
                    <span className="text-sm text-gray-400">Recomendado</span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        API Key do Google AI Studio
                      </label>
                      <input
                        type="password"
                        value={apiKeys.gemini || ''}
                        onChange={(e) => setApiKeys(prev => ({ ...prev, gemini: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Cole sua chave da API do Gemini aqui"
                      />
                    </div>

                    <div className="flex space-x-4">
                      <button
                        onClick={() => setActiveTab('audio-test')}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center"
                      >
                        <TestTube className="h-4 w-4 mr-2" />
                        Testar Conexão
                      </button>
                      <a
                        href="https://aistudio.google.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-md flex items-center"
                      >
                        <Link className="h-4 w-4 mr-2" />
                        Obter API Key
                      </a>
                    </div>

                    <div className="p-3 bg-blue-900/30 border border-blue-700 rounded-md">
                      <p className="text-blue-200 text-sm">
                        <strong>Como obter:</strong> Acesse o Google AI Studio, faça login, vá em "Get API Key" e copie a chave gerada.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Configuração ElevenLabs */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg mb-6">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${apiKeys.elevenlabs ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <h3 className="text-xl font-semibold text-white">ElevenLabs</h3>
                    </div>
                    <span className="text-sm text-gray-400">Premium</span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        API Key do ElevenLabs
                      </label>
                      <input
                        type="password"
                        value={apiKeys.elevenlabs || ''}
                        onChange={(e) => setApiKeys(prev => ({ ...prev, elevenlabs: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Cole sua chave da API do ElevenLabs aqui"
                      />
                    </div>

                    <div className="flex space-x-4">
                      <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md flex items-center">
                        <TestTube className="h-4 w-4 mr-2" />
                        Testar Conexão
                      </button>
                      <a
                        href="https://elevenlabs.io/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-md flex items-center"
                      >
                        <Link className="h-4 w-4 mr-2" />
                        Criar Conta
                      </a>
                    </div>

                    <div className="p-3 bg-purple-900/30 border border-purple-700 rounded-md">
                      <p className="text-purple-200 text-sm">
                        <strong>Qualidade Premium:</strong> Melhor qualidade de voz disponível, ideal para produção profissional.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Configuração OpenAI */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${apiKeys.openai ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <h3 className="text-xl font-semibold text-white">OpenAI TTS</h3>
                    </div>
                    <span className="text-sm text-gray-400">ChatGPT</span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        API Key do OpenAI
                      </label>
                      <input
                        type="password"
                        value={apiKeys.openai || ''}
                        onChange={(e) => setApiKeys(prev => ({ ...prev, openai: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Cole sua chave da API do OpenAI aqui"
                      />
                    </div>

                    <div className="flex space-x-4">
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center">
                        <TestTube className="h-4 w-4 mr-2" />
                        Testar Conexão
                      </button>
                      <a
                        href="https://platform.openai.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-md flex items-center"
                      >
                        <Link className="h-4 w-4 mr-2" />
                        Obter API Key
                      </a>
                    </div>

                    <div className="p-3 bg-blue-900/30 border border-blue-700 rounded-md">
                      <p className="text-blue-200 text-sm">
                        <strong>Integração ChatGPT:</strong> Mesma tecnologia do ChatGPT, 6 vozes disponíveis.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'audio':
        return (
          <div className="p-8">
            <div className="max-w-6xl mx-auto">
              <div className="mb-8">
                <div className="flex items-center space-x-3 mb-4">
                  <Mic className="h-8 w-8 text-red-500" />
                  <h1 className="text-3xl font-bold text-white">Gerador de Áudio com IA</h1>
                </div>
                <p className="text-gray-400">Converta roteiros em áudio com vozes naturais usando diferentes serviços de IA</p>

                {/* Instruções de uso */}
                {!audioText && (
                  <div className="mt-4 p-4 bg-blue-900/30 border border-blue-700 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5" />
                      <div>
                        <h4 className="text-blue-300 font-medium mb-2">Como usar:</h4>
                        <ol className="text-sm text-blue-200 space-y-1">
                          <li>1. Vá para a página <strong>Roteiros</strong> e gere um roteiro completo</li>
                          <li>2. Volte aqui e clique em <strong>Importar Roteiro</strong></li>
                          <li>3. Escolha o serviço de áudio e configure a voz</li>
                          <li>4. Clique em <strong>Gerar Áudio</strong></li>
                        </ol>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Configuração do Áudio */}
                <div className="space-y-6">
                  {/* Importar Roteiro */}
                  <div className="bg-gray-800 border border-gray-700 rounded-lg">
                    <div className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <Plus className="h-6 w-6 text-blue-500" />
                        <h3 className="text-xl font-semibold text-white">Importar Roteiro</h3>
                      </div>
                      <p className="text-sm text-gray-400 mb-4">
                        Importe um roteiro gerado na página de Roteiros para converter em áudio
                      </p>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={importScriptToAudio}
                          disabled={!generatedScript || !generatedScript.chapters}
                          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 px-4 rounded-md flex items-center"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Importar Roteiro
                        </button>
                        <span className="text-sm text-gray-400">
                          {generatedScript && generatedScript.chapters ?
                            `Roteiro com ${generatedScript.chapters.length} capítulos disponível` :
                            'Nenhum roteiro disponível - Vá para Roteiros primeiro'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Texto do Áudio */}
                  <div className="bg-gray-800 border border-gray-700 rounded-lg">
                    <div className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <FileText className="h-6 w-6 text-green-500" />
                        <h3 className="text-xl font-semibold text-white">Texto para Áudio</h3>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Texto *
                        </label>
                        <textarea
                          value={audioText}
                          onChange={(e) => setAudioText(e.target.value)}
                          placeholder="Digite ou importe o texto que será convertido em áudio"
                          rows={8}
                          className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                        />
                        <div className="flex justify-between items-center mt-2">
                          <p className="text-xs text-gray-500">
                            {audioText.length} caracteres • ~{Math.ceil(audioText.length / 1000)} minutos de áudio
                          </p>
                          {audioText && (
                            <button
                              onClick={() => setAudioText('')}
                              className="text-red-400 hover:text-red-300 text-xs"
                            >
                              Limpar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Serviço de Áudio */}
                  <div className="bg-gray-800 border border-gray-700 rounded-lg">
                    <div className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <Bot className="h-6 w-6 text-purple-500" />
                        <h3 className="text-xl font-semibold text-white">Serviço de Áudio</h3>
                      </div>

                      <div className="space-y-4">
                        {/* Seleção do Serviço */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Serviço de TTS
                          </label>
                          <select
                            value={selectedAudioService}
                            onChange={(e) => {
                              setSelectedAudioService(e.target.value);
                              loadAvailableVoices(e.target.value);
                            }}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          >
                            <optgroup label="Serviços Recomendados">
                              <option value="gemini">Google Gemini TTS (Novo!)</option>
                              <option value="chatterbox">Chatterbox TTS (Open Source)</option>
                              <option value="elevenlabs">ElevenLabs (Premium)</option>
                              <option value="openai">OpenAI TTS</option>
                            </optgroup>
                            <optgroup label="Outros Serviços Pagos">
                              <option value="azure">Azure Speech</option>
                              <option value="aws">AWS Polly</option>
                              <option value="google">Google Text-to-Speech</option>
                            </optgroup>
                            <optgroup label="Serviços Gratuitos">
                              <option value="edge">Microsoft Edge TTS</option>
                              <option value="coqui">Coqui TTS (Local)</option>
                              <option value="kokoro">Kokoro TTS</option>
                            </optgroup>
                          </select>
                        </div>

                        {/* Status da API */}
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            {apiValidation[selectedAudioService === 'elevenlabs' ? 'elevenlabs' : selectedAudioService] === 'valid' ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : apiValidation[selectedAudioService === 'elevenlabs' ? 'elevenlabs' : selectedAudioService] === 'invalid' ? (
                              <AlertCircle className="h-4 w-4 text-red-500" />
                            ) : (
                              <Cog className="h-4 w-4 text-gray-500" />
                            )}
                            <span className="ml-2 text-sm text-gray-400">
                              {apiValidation[selectedAudioService === 'elevenlabs' ? 'elevenlabs' : selectedAudioService] === 'valid' ? 'API Configurada' :
                               apiValidation[selectedAudioService === 'elevenlabs' ? 'elevenlabs' : selectedAudioService] === 'invalid' ? 'API com Erro' :
                               'API Não Configurada'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Configurações de Voz */}
                  <div className="bg-gray-800 border border-gray-700 rounded-lg">
                    <div className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <Music className="h-6 w-6 text-yellow-500" />
                        <h3 className="text-xl font-semibold text-white">Configurações de Voz</h3>
                      </div>

                      <div className="space-y-4">
                        {/* Seleção de Voz */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Voz
                          </label>
                          <select
                            value={selectedVoice}
                            onChange={(e) => setSelectedVoice(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          >
                            {availableVoices.length > 0 ? (
                              availableVoices.map(voice => (
                                <option key={voice.id} value={voice.id}>
                                  {voice.name} ({voice.gender || 'Neutro'})
                                </option>
                              ))
                            ) : (
                              <option value="">Configure a API para carregar vozes</option>
                            )}
                          </select>
                        </div>

                        {/* Configurações Avançadas */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Velocidade: {audioSettings.speed}x
                            </label>
                            <input
                              type="range"
                              min="0.5"
                              max="2.0"
                              step="0.1"
                              value={audioSettings.speed}
                              onChange={(e) => setAudioSettings(prev => ({ ...prev, speed: parseFloat(e.target.value) }))}
                              className="w-full"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Estabilidade: {audioSettings.stability}
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.1"
                              value={audioSettings.stability}
                              onChange={(e) => setAudioSettings(prev => ({ ...prev, stability: parseFloat(e.target.value) }))}
                              className="w-full"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Opções de Geração */}
                  <div className="bg-gray-800 border border-gray-700 rounded-lg">
                    <div className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <Zap className="h-6 w-6 text-yellow-500" />
                        <h3 className="text-xl font-semibold text-white">Opções de Geração</h3>
                      </div>

                      <div className="space-y-4">
                        {/* Geração Simples */}
                        <button
                          onClick={generateAudioWithAI}
                          disabled={isGeneratingAudio || !audioText.trim() || (!apiKeys[selectedAudioService === 'elevenlabs' ? 'elevenlabs' : selectedAudioService] && selectedAudioService !== 'edge' && selectedAudioService !== 'coqui' && selectedAudioService !== 'kokoro' && selectedAudioService !== 'chatterbox')}
                          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 px-6 rounded-md flex items-center justify-center text-lg font-semibold"
                        >
                          {isGeneratingAudio ? (
                            <>
                              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                              Gerando Áudio...
                            </>
                          ) : (
                            <>
                              <Mic className="h-5 w-5 mr-2" />
                              Gerar Áudio Simples
                            </>
                          )}
                        </button>

                        {/* Geração em Segmentos */}
                        <button
                          onClick={generateAudioSegments}
                          disabled={isGeneratingSegments || !audioText.trim() || (!apiKeys[selectedAudioService === 'elevenlabs' ? 'elevenlabs' : selectedAudioService] && selectedAudioService !== 'edge' && selectedAudioService !== 'coqui' && selectedAudioService !== 'kokoro' && selectedAudioService !== 'chatterbox')}
                          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 px-6 rounded-md flex items-center justify-center text-lg font-semibold"
                        >
                          {isGeneratingSegments ? (
                            <>
                              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                              Gerando Segmentos... {segmentGenerationProgress}%
                            </>
                          ) : (
                            <>
                              <Scissors className="h-5 w-5 mr-2" />
                              Gerar em Segmentos (10min cada)
                            </>
                          )}
                        </button>

                        {/* Juntar Segmentos */}
                        {audioSegments.length > 0 && (
                          <button
                            onClick={joinAudioSegments}
                            disabled={isJoiningAudio}
                            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 px-6 rounded-md flex items-center justify-center text-lg font-semibold"
                          >
                            {isJoiningAudio ? (
                              <>
                                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                Juntando Áudios...
                              </>
                            ) : (
                              <>
                                <Link className="h-5 w-5 mr-2" />
                                Juntar {audioSegments.length} Segmentos
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      <div className="mt-4 p-3 bg-blue-900/30 border border-blue-700 rounded-md">
                        <p className="text-blue-200 text-sm">
                          <strong>Dica:</strong> Para roteiros longos (1h+), use "Gerar em Segmentos" para dividir em partes de ~10 minutos e depois junte os áudios.
                        </p>
                      </div>

                      {/* Status dos Serviços */}
                      <div className="mt-4 p-3 bg-gray-700 rounded-md">
                        <h4 className="text-white font-medium mb-2">Status dos Serviços TTS</h4>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center">
                            <div className={`w-2 h-2 rounded-full mr-2 ${apiKeys.gemini ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className="text-gray-300">Gemini TTS</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-2 h-2 rounded-full mr-2 bg-green-500"></div>
                            <span className="text-gray-300">Chatterbox (Local)</span>
                          </div>
                          <div className="flex items-center">
                            <div className={`w-2 h-2 rounded-full mr-2 ${apiKeys.elevenlabs ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className="text-gray-300">ElevenLabs</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-2 h-2 rounded-full mr-2 bg-green-500"></div>
                            <span className="text-gray-300">Edge TTS (Grátis)</span>
                          </div>
                        </div>
                        <p className="text-gray-400 text-xs mt-2">
                          🟢 Disponível | 🔴 Requer configuração de API
                        </p>
                      </div>

                      {audioGenerationError && (
                        <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded-md">
                          <div className="flex items-center">
                            <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                            <span className="text-red-300 text-sm">{audioGenerationError}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Resultado do Áudio */}
                <div className="space-y-6">
                  {/* Áudio Simples */}
                  <div className="bg-gray-800 border border-gray-700 rounded-lg">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <Music className="h-6 w-6 text-green-500" />
                          <h3 className="text-xl font-semibold text-white">Áudio Simples</h3>
                        </div>
                        {generatedAudio && (
                          <button
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = generatedAudio.url;
                              link.download = `audio_simples_${Date.now()}.mp3`;
                              link.click();
                            }}
                            className="bg-gray-700 hover:bg-gray-600 text-white py-1 px-3 rounded-md flex items-center text-sm"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </button>
                        )}
                      </div>

                      {!generatedAudio ? (
                        <div className="text-center py-8">
                          <Mic className="h-12 w-12 text-gray-600 mx-auto mb-2" />
                          <p className="text-gray-400 text-sm">Nenhum áudio simples gerado</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="bg-gray-700 rounded-lg p-4">
                            <audio controls className="w-full" src={generatedAudio.url}>
                              Seu navegador não suporta o elemento de áudio.
                            </audio>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="bg-gray-700 rounded-lg p-3">
                              <div className="text-xl font-bold text-blue-500">
                                {generatedAudio.duration || 'N/A'}
                              </div>
                              <div className="text-xs text-gray-400">Duração</div>
                            </div>
                            <div className="bg-gray-700 rounded-lg p-3">
                              <div className="text-xl font-bold text-green-500">
                                {generatedAudio.service.toUpperCase()}
                              </div>
                              <div className="text-xs text-gray-400">Serviço</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Segmentos de Áudio */}
                  <div className="bg-gray-800 border border-gray-700 rounded-lg">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <Scissors className="h-6 w-6 text-orange-500" />
                          <h3 className="text-xl font-semibold text-white">Segmentos de Áudio</h3>
                        </div>
                        {audioSegments.length > 0 && (
                          <span className="bg-orange-600 text-white px-2 py-1 rounded text-sm">
                            {audioSegments.length} segmentos
                          </span>
                        )}
                      </div>

                      {audioSegments.length === 0 ? (
                        <div className="text-center py-8">
                          <Scissors className="h-12 w-12 text-gray-600 mx-auto mb-2" />
                          <p className="text-gray-400 text-sm">Nenhum segmento gerado ainda</p>
                          <p className="text-gray-500 text-xs mt-1">Use "Gerar em Segmentos" para roteiros longos</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {audioSegments.map((segment, index) => (
                            <div key={index} className="bg-gray-700 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-white font-medium">Segmento {segment.index}</h4>
                                <button
                                  onClick={() => {
                                    const link = document.createElement('a');
                                    link.href = segment.url;
                                    link.download = `segmento_${segment.index}.mp3`;
                                    link.click();
                                  }}
                                  className="bg-gray-600 hover:bg-gray-500 text-white py-1 px-2 rounded text-xs flex items-center"
                                >
                                  <Download className="h-3 w-3 mr-1" />
                                  Download
                                </button>
                              </div>
                              <audio controls className="w-full mb-2" src={segment.url}>
                                Seu navegador não suporta o elemento de áudio.
                              </audio>
                              <p className="text-gray-400 text-xs">{segment.text}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Áudio Final (Juntado) */}
                  {finalAudio && (
                    <div className="bg-gray-800 border border-gray-700 rounded-lg">
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <Link className="h-6 w-6 text-purple-500" />
                            <h3 className="text-xl font-semibold text-white">Áudio Final Completo</h3>
                          </div>
                          <button
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = finalAudio.url;
                              link.download = `audio_completo_${Date.now()}.mp3`;
                              link.click();
                            }}
                            className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md flex items-center"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download Completo
                          </button>
                        </div>

                        <div className="space-y-4">
                          <div className="bg-gray-700 rounded-lg p-4">
                            <audio controls className="w-full" src={finalAudio.url}>
                              Seu navegador não suporta o elemento de áudio.
                            </audio>
                          </div>

                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="bg-gray-700 rounded-lg p-3">
                              <div className="text-xl font-bold text-purple-500">
                                {finalAudio.duration || 'N/A'}
                              </div>
                              <div className="text-xs text-gray-400">Duração Total</div>
                            </div>
                            <div className="bg-gray-700 rounded-lg p-3">
                              <div className="text-xl font-bold text-orange-500">
                                {finalAudio.segments_count}
                              </div>
                              <div className="text-xs text-gray-400">Segmentos</div>
                            </div>
                            <div className="bg-gray-700 rounded-lg p-3">
                              <div className="text-xl font-bold text-green-500">
                                {finalAudio.service.toUpperCase()}
                              </div>
                              <div className="text-xs text-gray-400">Serviço</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'imagens':
        return (
          <div className="p-8">
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <div className="flex items-center space-x-3 mb-4">
                  <ImageIcon className="h-8 w-8 text-red-500" />
                  <h1 className="text-3xl font-bold text-white">Gerador de Imagens</h1>
                </div>
                <p className="text-gray-400">Crie thumbnails e imagens personalizadas</p>
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <p className="text-white">Funcionalidade em desenvolvimento...</p>
              </div>
            </div>
          </div>
        );

      case 'teste-rapidapi':
        return <TestRapidAPI />;

      case 'gemini-tts':
        return <TestGeminiTTS />;

      case 'gemini-audio':
        return (
          <div className="p-8">
            <div className="max-w-6xl mx-auto">
              <div className="mb-8">
                <div className="flex items-center space-x-3 mb-4">
                  <Volume2 className="h-8 w-8 text-red-500" />
                  <h1 className="text-3xl font-bold text-white">Gemini TTS - Gerador de Áudio Profissional</h1>
                </div>
                <p className="text-gray-400">
                  Converta roteiros em áudio de alta qualidade usando a tecnologia avançada de síntese de voz do Google Gemini 2.5
                </p>

                {/* Instruções de uso */}
                {!audioText && (
                  <div className="mt-4 p-4 bg-blue-900/30 border border-blue-700 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5" />
                      <div>
                        <h4 className="text-blue-300 font-medium mb-2">Como usar o Gemini TTS:</h4>
                        <ol className="text-sm text-blue-200 space-y-1">
                          <li>1. Configure sua chave da API Gemini nas <strong>Configurações</strong></li>
                          <li>2. Importe um roteiro da página <strong>Roteiros</strong> ou digite seu texto</li>
                          <li>3. Escolha uma das 30 vozes disponíveis do Gemini</li>
                          <li>4. Selecione o modelo (Flash ou Pro) e clique em <strong>Gerar Áudio</strong></li>
                          <li>5. Reproduza, baixe ou use o áudio gerado em seus projetos</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                )}

                {/* Informações sobre limites gratuitos */}
                <div className="mt-4 p-4 bg-yellow-900/30 border border-yellow-700 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
                    <div>
                      <h4 className="text-yellow-300 font-medium mb-2">📊 Limites Gratuitos do Gemini:</h4>
                      <div className="text-sm text-yellow-200 space-y-1">
                        <p><strong>🎵 TTS (Áudio):</strong> 15 requests/minuto • ~1000 requests/dia</p>
                        <p><strong>🎨 Imagen (Imagens):</strong> 15 requests/minuto • ~1000 requests/dia</p>
                        <p><strong>💡 Dica:</strong> Use múltiplas APIs para aumentar o limite diário</p>
                        <button
                          onClick={() => setShowGeminiApiManager(!showGeminiApiManager)}
                          className="mt-2 text-yellow-300 hover:text-yellow-200 underline text-sm"
                        >
                          {showGeminiApiManager ? 'Ocultar' : 'Gerenciar'} APIs Gemini ({geminiApiKeys.length + (apiKeys.gemini ? 1 : 0)} configuradas)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Gerenciador de APIs Gemini */}
                {showGeminiApiManager && (
                  <div className="mt-4 p-4 bg-gray-800 border border-gray-700 rounded-lg">
                    <h4 className="text-white font-medium mb-3">🔑 Gerenciador de APIs Gemini</h4>

                    {/* Lista de APIs atuais */}
                    <div className="space-y-2 mb-4">
                      {/* API principal */}
                      {apiKeys.gemini && (
                        <div className="flex items-center justify-between p-2 bg-gray-700 rounded">
                          <div className="flex items-center space-x-2">
                            <span className="text-green-400 text-xs bg-green-900 px-2 py-1 rounded">PRINCIPAL</span>
                            <span className="text-gray-300 text-sm">
                              {apiKeys.gemini.substring(0, 8)}...{apiKeys.gemini.slice(-4)}
                            </span>
                            <span className="text-xs text-gray-400">
                              Usado hoje: {geminiUsageToday[apiKeys.gemini]?.count || 0}/950
                            </span>
                          </div>
                        </div>
                      )}

                      {/* APIs adicionais */}
                      {geminiApiKeys.map((apiKey, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-700 rounded">
                          <div className="flex items-center space-x-2">
                            <span className="text-blue-400 text-xs bg-blue-900 px-2 py-1 rounded">API {index + 2}</span>
                            <span className="text-gray-300 text-sm">
                              {apiKey.substring(0, 8)}...{apiKey.slice(-4)}
                            </span>
                            <span className="text-xs text-gray-400">
                              Usado hoje: {geminiUsageToday[apiKey]?.count || 0}/950
                            </span>
                          </div>
                          <button
                            onClick={() => removeGeminiApiKey(apiKey)}
                            className="text-red-400 hover:text-red-300 text-xs"
                          >
                            Remover
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Adicionar nova API */}
                    <div className="flex space-x-2">
                      <input
                        type="password"
                        placeholder="Cole nova chave da API Gemini..."
                        className="flex-1 bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-md text-sm"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && e.target.value.trim()) {
                            addGeminiApiKey(e.target.value.trim());
                            e.target.value = '';
                          }
                        }}
                      />
                      <button
                        onClick={(e) => {
                          const input = e.target.previousElementSibling;
                          if (input.value.trim()) {
                            addGeminiApiKey(input.value.trim());
                            input.value = '';
                          }
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
                      >
                        Adicionar
                      </button>
                    </div>

                    <p className="text-xs text-gray-400 mt-2">
                      💡 Adicione até 10 APIs para rotação automática e aumento do limite diário
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Configuração do Áudio */}
                <div className="space-y-6">
                  {/* Importar Roteiro */}
                  <div className="bg-gray-800 border border-gray-700 rounded-lg">
                    <div className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <Plus className="h-6 w-6 text-blue-500" />
                        <h3 className="text-xl font-semibold text-white">Importar Roteiro</h3>
                      </div>
                      <p className="text-sm text-gray-400 mb-4">
                        Importe um roteiro gerado na página de Roteiros para converter em áudio com Gemini TTS
                      </p>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={importScriptToAudio}
                          disabled={!generatedScript || !generatedScript.chapters}
                          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 px-4 rounded-md flex items-center"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Importar Roteiro
                        </button>
                        <span className="text-sm text-gray-400">
                          {generatedScript && generatedScript.chapters ?
                            `Roteiro com ${generatedScript.chapters.length} capítulos disponível` :
                            'Nenhum roteiro disponível - Vá para Roteiros primeiro'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Texto do Áudio */}
                  <div className="bg-gray-800 border border-gray-700 rounded-lg">
                    <div className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <FileText className="h-6 w-6 text-green-500" />
                        <h3 className="text-xl font-semibold text-white">Texto para Conversão</h3>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Texto para Áudio *
                        </label>
                        <textarea
                          value={audioText}
                          onChange={(e) => setAudioText(e.target.value)}
                          placeholder="Digite ou importe o texto que será convertido em áudio usando Gemini TTS..."
                          rows={8}
                          className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm text-gray-400">
                            Caracteres: {audioText.length}
                          </span>
                          <span className="text-sm text-gray-400">
                            Tempo estimado: ~{Math.ceil(audioText.length / 150)} min
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Configurações do Gemini TTS */}
                  <div className="bg-gray-800 border border-gray-700 rounded-lg">
                    <div className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <Settings className="h-6 w-6 text-purple-500" />
                        <h3 className="text-xl font-semibold text-white">Configurações Gemini TTS</h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Seleção de Voz */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Voz do Gemini
                          </label>
                          <select
                            value={selectedGeminiVoice}
                            onChange={(e) => setSelectedGeminiVoice(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          >
                            <option value="Kore">Kore - Firm</option>
                            <option value="Puck">Puck - Upbeat</option>
                            <option value="Zephyr">Zephyr - Bright</option>
                            <option value="Charon">Charon - Informativo</option>
                            <option value="Fenrir">Fenrir - Excitável</option>
                            <option value="Leda">Leda - Youthful</option>
                            <option value="Orus">Orus - Empresa</option>
                            <option value="Aoede">Aoede - Breezy</option>
                            <option value="Callirrhoe">Callirrhoe - Tranquila</option>
                            <option value="Autonoe">Autonoe - Bright</option>
                            <option value="Enceladus">Enceladus - Breathy</option>
                            <option value="Iapetus">Iapetus - Clear</option>
                            <option value="Umbriel">Umbriel - Tranquila</option>
                            <option value="Algieba">Algieba - Smooth</option>
                            <option value="Despina">Despina - Smooth</option>
                            <option value="Erinome">Erinome - Clear</option>
                            <option value="Algenib">Algenib - Gravelly</option>
                            <option value="Rasalgethi">Rasalgethi - Informativo</option>
                            <option value="Laomedeia">Laomedeia - Upbeat</option>
                            <option value="Achernar">Achernar - Suave</option>
                          </select>
                        </div>

                        {/* Seleção de Modelo */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Modelo Gemini
                          </label>
                          <select
                            value={selectedGeminiModel}
                            onChange={(e) => setSelectedGeminiModel(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          >
                            <option value="gemini-2.5-flash-preview-tts">Gemini 2.5 Flash TTS (Rápido)</option>
                            <option value="gemini-2.5-pro-preview-tts">Gemini 2.5 Pro TTS (Qualidade Superior)</option>
                          </select>
                        </div>
                      </div>

                      {/* Opções de Geração */}
                      <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                          Opções de Geração
                        </label>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <input
                              type="radio"
                              id="gemini-simple"
                              name="gemini-generation-type"
                              value="simple"
                              checked={geminiGenerationType === 'simple'}
                              onChange={(e) => setGeminiGenerationType(e.target.value)}
                              className="text-red-600 focus:ring-red-500"
                            />
                            <label htmlFor="gemini-simple" className="text-white">
                              <span className="font-medium">Gerar Áudio Simples</span>
                              <p className="text-sm text-gray-400">Ideal para textos curtos (até 5 minutos)</p>
                            </label>
                          </div>

                          <div className="flex items-center space-x-3">
                            <input
                              type="radio"
                              id="gemini-segments"
                              name="gemini-generation-type"
                              value="segments"
                              checked={geminiGenerationType === 'segments'}
                              onChange={(e) => setGeminiGenerationType(e.target.value)}
                              className="text-red-600 focus:ring-red-500"
                            />
                            <label htmlFor="gemini-segments" className="text-white">
                              <span className="font-medium">Gerar em Segmentos (10min cada)</span>
                              <p className="text-sm text-gray-400">Para roteiros longos (1h+), divide em partes de ~10 minutos</p>
                            </label>
                          </div>
                        </div>

                        {geminiGenerationType === 'segments' && (
                          <div className="mt-3 p-3 bg-blue-900/30 border border-blue-700 rounded-md">
                            <div className="flex items-start space-x-2">
                              <AlertCircle className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                              <div className="text-sm text-blue-200">
                                <strong>Dica:</strong> Para roteiros longos (1h+), use "Gerar em Segmentos" para dividir em partes de ~10 minutos.
                                Depois você pode juntar os áudios usando ferramentas de edição.
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Botões de Gerar */}
                      <div className="mt-6 space-y-3">
                        {geminiGenerationType === 'simple' ? (
                          <button
                            onClick={generateGeminiAudio}
                            disabled={isGeneratingAudio || !audioText.trim() || !apiKeys.gemini}
                            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 px-6 rounded-md flex items-center justify-center text-lg font-semibold"
                          >
                            {isGeneratingAudio ? (
                              <>
                                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                Gerando Áudio Simples...
                              </>
                            ) : (
                              <>
                                <Volume2 className="h-5 w-5 mr-2" />
                                🚀 Gerar Áudio Simples
                              </>
                            )}
                          </button>
                        ) : (
                          <button
                            onClick={generateGeminiAudioSegments}
                            disabled={isGeneratingGeminiSegments || !audioText.trim() || !apiKeys.gemini}
                            className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 px-6 rounded-md flex items-center justify-center text-lg font-semibold"
                          >
                            {isGeneratingGeminiSegments ? (
                              <>
                                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                Gerando Segmentos...
                              </>
                            ) : (
                              <>
                                <Scissors className="h-5 w-5 mr-2" />
                                🎬 Gerar em Segmentos (10min cada)
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      {/* Status da API */}
                      <div className="mt-4 p-3 bg-gray-700 rounded-md">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-300">Status da API Gemini:</span>
                          <span className={`text-sm font-medium ${apiKeys.gemini ? 'text-green-400' : 'text-red-400'}`}>
                            {apiKeys.gemini ? '✅ Configurada' : '❌ Não configurada'}
                          </span>
                        </div>
                        {!apiKeys.gemini && (
                          <p className="text-xs text-gray-400 mt-1">
                            Configure sua chave da API Gemini nas Configurações
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Resultado do Áudio */}
                <div className="space-y-6">
                  {/* Player de Áudio */}
                  {generatedAudioUrl && (
                    <div className="bg-gray-800 border border-gray-700 rounded-lg">
                      <div className="p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <Play className="h-6 w-6 text-green-500" />
                          <h3 className="text-xl font-semibold text-white">Áudio Gerado</h3>
                        </div>

                        <div className="space-y-4">
                          {/* Informações do áudio */}
                          <div className="bg-gray-700 rounded-lg p-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-400">Serviço:</span>
                                <span className="text-white ml-2">Gemini TTS</span>
                              </div>
                              <div>
                                <span className="text-gray-400">Voz:</span>
                                <span className="text-white ml-2">{selectedGeminiVoice}</span>
                              </div>
                              <div>
                                <span className="text-gray-400">Modelo:</span>
                                <span className="text-white ml-2">
                                  {selectedGeminiModel.includes('flash') ? 'Flash' : 'Pro'}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-400">Duração:</span>
                                <span className="text-white ml-2">{audioDuration || 'Calculando...'}</span>
                              </div>
                            </div>
                          </div>

                          {/* Player de áudio */}
                          <audio controls className="w-full">
                            <source src={generatedAudioUrl} type="audio/wav" />
                            Seu navegador não suporta o elemento de áudio.
                          </audio>

                          {/* Botões de ação */}
                          <div className="flex space-x-3">
                            <button
                              onClick={() => {
                                const audio = new Audio(generatedAudioUrl);
                                audio.play();
                              }}
                              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md flex items-center"
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Reproduzir
                            </button>

                            <button
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = generatedAudioUrl;
                                link.download = `gemini_audio_${Date.now()}.wav`;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Segmentos Gerados */}
                  {geminiSegments.length > 0 && (
                    <div className="bg-gray-800 border border-gray-700 rounded-lg">
                      <div className="p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <Scissors className="h-6 w-6 text-orange-500" />
                          <h3 className="text-xl font-semibold text-white">Segmentos Gerados</h3>
                          <span className="bg-orange-600 text-white px-2 py-1 rounded text-xs">
                            {geminiSegments.length} segmentos
                          </span>
                        </div>

                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {geminiSegments.map((segment, index) => (
                            <div key={index} className="bg-gray-700 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-3">
                                  <span className="bg-orange-600 text-white px-2 py-1 rounded text-xs font-medium">
                                    Segmento {segment.index}
                                  </span>
                                  <div>
                                    <p className="text-white font-medium">
                                      {segment.status === 'completed' ? '✅ Concluído' : '❌ Erro'}
                                    </p>
                                    <p className="text-sm text-gray-400">
                                      Duração: {segment.duration}
                                    </p>
                                  </div>
                                </div>
                                {segment.status === 'completed' && (
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => {
                                        const audioElement = new Audio(segment.url);
                                        audioElement.play();
                                      }}
                                      className="text-green-400 hover:text-green-300"
                                      title="Reproduzir segmento"
                                    >
                                      <Play className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        const link = document.createElement('a');
                                        link.href = segment.url;
                                        link.download = `gemini_segmento_${segment.index}.wav`;
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                      }}
                                      className="text-blue-400 hover:text-blue-300"
                                      title="Download segmento"
                                    >
                                      <Download className="h-4 w-4" />
                                    </button>
                                  </div>
                                )}
                              </div>
                              <p className="text-sm text-gray-300 truncate">
                                {segment.text}
                              </p>
                              {segment.status === 'error' && (
                                <p className="text-sm text-red-400 mt-2">
                                  Erro: {segment.error}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>

                        {geminiSegments.length > 0 && geminiSegments.every(s => s.status === 'completed') && (
                          <div className="mt-4 p-3 bg-green-900/30 border border-green-700 rounded-md">
                            <div className="flex items-start space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                              <div className="text-sm text-green-200">
                                <strong>Todos os segmentos foram gerados com sucesso!</strong>
                                <br />
                                Você pode reproduzir e baixar cada segmento individualmente.
                                Para juntar os áudios, use ferramentas como Audacity ou similar.
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Histórico de Áudios */}
                  <div className="bg-gray-800 border border-gray-700 rounded-lg">
                    <div className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <Music className="h-6 w-6 text-yellow-500" />
                        <h3 className="text-xl font-semibold text-white">Histórico de Áudios</h3>
                      </div>

                      {audioHistory.length === 0 ? (
                        <div className="text-center py-8">
                          <Music className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                          <p className="text-gray-400 mb-2">Nenhum áudio gerado ainda</p>
                          <p className="text-sm text-gray-500">
                            Os áudios gerados aparecerão aqui para fácil acesso
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {audioHistory.map((audio, index) => (
                            <div key={index} className="bg-gray-700 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-3">
                                  <Volume2 className="h-5 w-5 text-red-500" />
                                  <div>
                                    <p className="text-white font-medium">
                                      {audio.service} - {audio.voice}
                                    </p>
                                    <p className="text-sm text-gray-400">
                                      {audio.duration} • {new Date(audio.timestamp).toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => {
                                      const audioElement = new Audio(audio.url);
                                      audioElement.play();
                                    }}
                                    className="text-green-400 hover:text-green-300"
                                  >
                                    <Play className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      const link = document.createElement('a');
                                      link.href = audio.url;
                                      link.download = `audio_${audio.timestamp}.wav`;
                                      document.body.appendChild(link);
                                      link.click();
                                      document.body.removeChild(link);
                                    }}
                                    className="text-blue-400 hover:text-blue-300"
                                  >
                                    <Download className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                              <p className="text-sm text-gray-300 truncate">
                                {audio.text.substring(0, 100)}...
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'image-generation':
        return (
          <div className="p-8">
            <div className="max-w-6xl mx-auto">
              <div className="mb-8">
                <div className="flex items-center space-x-3 mb-4">
                  <ImageIcon className="h-8 w-8 text-purple-500" />
                  <h1 className="text-3xl font-bold text-white">Geração de Imagens com IA</h1>
                </div>
                <p className="text-gray-400">
                  Crie imagens incríveis usando diferentes serviços de IA - opções gratuitas e premium disponíveis
                </p>

                {/* Instruções de uso */}
                {generatedImages.length === 0 && (
                  <div className="mt-4 p-4 bg-purple-900/30 border border-purple-700 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="h-5 w-5 text-purple-400 mt-0.5" />
                      <div>
                        <h4 className="text-purple-300 font-medium mb-2">Como usar:</h4>
                        <ol className="text-sm text-purple-200 space-y-1">
                          <li>1. Digite uma descrição detalhada da imagem que deseja</li>
                          <li>2. Escolha um serviço (Pollinations é gratuito, outros requerem API)</li>
                          <li>3. Configure as dimensões e estilo desejados</li>
                          <li>4. Clique em <strong>Gerar Imagem</strong> e aguarde</li>
                          <li>5. Baixe ou compartilhe suas criações</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                )}

                {/* Informações sobre limites dos serviços */}
                <div className="mt-4 p-4 bg-green-900/30 border border-green-700 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-green-400 mt-0.5" />
                    <div>
                      <h4 className="text-green-300 font-medium mb-2">📊 Limites dos Serviços:</h4>
                      <div className="text-sm text-green-200 space-y-1">
                        <p><strong>🆓 Pollinations AI:</strong> Ilimitado e gratuito</p>
                        <p><strong>🆓 Together.ai FLUX:</strong> Gratuito com API key</p>
                        <p><strong>🆓 Lorem Picsum:</strong> Ilimitado e gratuito</p>
                        <p><strong>🆓 Unsplash Source:</strong> Ilimitado e gratuito</p>
                        <p><strong>💎 DALL-E 3:</strong> Pago por uso (OpenAI)</p>
                        <p><strong>💎 Gemini Imagen:</strong> 15 requests/minuto • ~1000/dia (gratuito)</p>
                        <p><strong>💎 Stability AI:</strong> Pago por uso</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Configuração da Imagem */}
                <div className="space-y-6">
                  {/* Prompt da Imagem */}
                  <div className="bg-gray-800 border border-gray-700 rounded-lg">
                    <div className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <Type className="h-6 w-6 text-green-500" />
                        <h3 className="text-xl font-semibold text-white">Descrição da Imagem</h3>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Prompt (Descrição) *
                        </label>
                        <textarea
                          value={imagePrompt}
                          onChange={(e) => setImagePrompt(e.target.value)}
                          placeholder="Descreva detalhadamente a imagem que você quer gerar... Ex: 'Um gato laranja dormindo em uma poltrona azul, estilo fotográfico, iluminação suave, alta qualidade'"
                          rows={4}
                          className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm text-gray-400">
                            Caracteres: {imagePrompt.length}
                          </span>
                          <span className="text-sm text-gray-400">
                            💡 Seja específico para melhores resultados
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Configurações do Serviço */}
                  <div className="bg-gray-800 border border-gray-700 rounded-lg">
                    <div className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <Settings className="h-6 w-6 text-blue-500" />
                        <h3 className="text-xl font-semibold text-white">Configurações</h3>
                      </div>

                      <div className="space-y-4">
                        {/* Seleção de Serviço */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Serviço de IA
                          </label>
                          <select
                            value={selectedImageService}
                            onChange={(e) => setSelectedImageService(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          >
                            <optgroup label="🆓 Serviços Gratuitos">
                              <option value="pollinations">Pollinations AI (Flux Models)</option>
                              <option value="together">Together.ai FLUX.1-schnell (Gratuito)</option>
                              <option value="picsum">Lorem Picsum (Fotos Reais)</option>
                              <option value="unsplash">Unsplash Source (Fotos HD)</option>
                            </optgroup>
                            <optgroup label="💎 Serviços Premium">
                              <option value="dalle">OpenAI DALL-E 3 (Requer API)</option>
                              <option value="gemini">Google Gemini Imagen (Requer API)</option>
                              <option value="stability">Stability AI (Requer API)</option>
                            </optgroup>
                          </select>
                        </div>

                        {/* Dimensões */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Largura
                            </label>
                            <select
                              value={imageSettings.width}
                              onChange={(e) => setImageSettings(prev => ({...prev, width: parseInt(e.target.value)}))}
                              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                              <option value={512}>512px</option>
                              <option value={768}>768px</option>
                              <option value={1024}>1024px</option>
                              <option value={1280}>1280px</option>
                              <option value={1920}>1920px (HD)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Altura
                            </label>
                            <select
                              value={imageSettings.height}
                              onChange={(e) => setImageSettings(prev => ({...prev, height: parseInt(e.target.value)}))}
                              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                              <option value={512}>512px</option>
                              <option value={768}>768px</option>
                              <option value={1024}>1024px</option>
                              <option value={1080}>1080px (HD)</option>
                              <option value={1440}>1440px</option>
                            </select>
                          </div>
                        </div>

                        {/* Configurações específicas por serviço */}
                        {selectedImageService === 'pollinations' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Modelo
                            </label>
                            <select
                              value={imageSettings.model}
                              onChange={(e) => setImageSettings(prev => ({...prev, model: e.target.value}))}
                              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                              <option value="flux-realism">Flux Realism (Fotográfico)</option>
                              <option value="flux">Flux (Geral)</option>
                              <option value="flux-anime">Flux Anime</option>
                              <option value="flux-3d">Flux 3D</option>
                            </select>
                          </div>
                        )}

                        {(selectedImageService === 'picsum' || selectedImageService === 'unsplash') && (
                          <div className="p-3 bg-green-900/30 border border-green-700 rounded-md">
                            <p className="text-green-200 text-sm">
                              <strong>Serviço gratuito:</strong> {selectedImageService === 'picsum' ? 'Fotos reais aleatórias' : 'Fotos HD baseadas em palavras-chave'}
                            </p>
                          </div>
                        )}

                        {selectedImageService === 'gemini' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Estilo
                            </label>
                            <select
                              value={imageSettings.style}
                              onChange={(e) => setImageSettings(prev => ({...prev, style: e.target.value}))}
                              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                              <option value="realistic">Realístico</option>
                              <option value="artistic">Artístico</option>
                              <option value="anime">Anime/Manga</option>
                              <option value="digital-art">Arte Digital</option>
                              <option value="photography">Fotografia</option>
                            </select>
                          </div>
                        )}

                        {selectedImageService === 'stability' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Estilo
                            </label>
                            <select
                              value={imageSettings.style}
                              onChange={(e) => setImageSettings(prev => ({...prev, style: e.target.value}))}
                              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                              <option value="realistic">Realístico</option>
                              <option value="artistic">Artístico</option>
                              <option value="anime">Anime</option>
                              <option value="digital-art">Arte Digital</option>
                            </select>
                          </div>
                        )}
                      </div>

                      {/* Botão de Gerar */}
                      <div className="mt-6">
                        <button
                          onClick={generateImageWithAI}
                          disabled={isGeneratingImage || !imagePrompt.trim() || (
                            !['pollinations', 'picsum', 'unsplash'].includes(selectedImageService) &&
                            !apiKeys[selectedImageService === 'dalle' ? 'openai' : selectedImageService]
                          )}
                          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 px-6 rounded-md flex items-center justify-center text-lg font-semibold"
                        >
                          {isGeneratingImage ? (
                            <>
                              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                              Gerando Imagem...
                            </>
                          ) : (
                            <>
                              <ImageIcon className="h-5 w-5 mr-2" />
                              🎨 Gerar Imagem
                            </>
                          )}
                        </button>
                      </div>

                      {/* Status da API */}
                      {!['pollinations', 'picsum', 'unsplash'].includes(selectedImageService) && (
                        <div className="mt-4 p-3 bg-gray-700 rounded-md">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-300">Status da API:</span>
                            <span className={`text-sm font-medium ${apiKeys[selectedImageService === 'dalle' ? 'openai' : selectedImageService] ? 'text-green-400' : 'text-red-400'}`}>
                              {apiKeys[selectedImageService === 'dalle' ? 'openai' : selectedImageService] ? '✅ Configurada' : '❌ Não configurada'}
                            </span>
                          </div>
                          {!apiKeys[selectedImageService === 'dalle' ? 'openai' : selectedImageService] && (
                            <p className="text-xs text-gray-400 mt-1">
                              Configure sua chave da API nas Configurações
                            </p>
                          )}
                        </div>
                      )}

                      {/* Informações do serviço */}
                      <div className="mt-4 p-3 bg-gray-700 rounded-md">
                        <div className="text-sm text-gray-300">
                          {selectedImageService === 'pollinations' && (
                            <div>
                              <strong>🆓 Pollinations AI:</strong> Serviço gratuito com modelos Flux avançados.
                              Ideal para criação de arte e imagens personalizadas.
                            </div>
                          )}
                          {selectedImageService === 'together' && (
                            <div>
                              <strong>🚀 Together.ai FLUX:</strong> Modelo FLUX.1-schnell gratuito de alta qualidade.
                              Requer API key do Together.ai para acesso.
                            </div>
                          )}
                          {selectedImageService === 'picsum' && (
                            <div>
                              <strong>🆓 Lorem Picsum:</strong> Fotos reais aleatórias em alta qualidade.
                              Perfeito para placeholders e testes.
                            </div>
                          )}
                          {selectedImageService === 'unsplash' && (
                            <div>
                              <strong>🆓 Unsplash Source:</strong> Fotos profissionais HD baseadas em palavras-chave.
                              Ideal para conteúdo real e profissional.
                            </div>
                          )}
                          {selectedImageService === 'dalle' && (
                            <div>
                              <strong>💎 DALL-E 3:</strong> IA da OpenAI com qualidade superior.
                              Requer créditos da API OpenAI.
                            </div>
                          )}
                          {selectedImageService === 'gemini' && (
                            <div>
                              <strong>💎 Gemini Imagen:</strong> IA do Google para geração de imagens.
                              Requer API key do Google AI Studio.
                            </div>
                          )}
                          {selectedImageService === 'stability' && (
                            <div>
                              <strong>💎 Stability AI:</strong> Modelos avançados para arte digital.
                              Requer API key própria da Stability AI.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Galeria de Imagens */}
                <div className="space-y-6">
                  {/* Status da geração atual */}
                  {currentImageGeneration && (
                    <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <Loader2 className="h-5 w-5 text-blue-400 mt-0.5 animate-spin flex-shrink-0" />
                        <div>
                          <div className="text-blue-200 font-medium">Gerando imagem...</div>
                          <div className="text-blue-300 text-sm mt-1">
                            Serviço: {currentImageGeneration.service.toUpperCase()} •
                            Prompt: {currentImageGeneration.prompt.substring(0, 50)}...
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Fila de geração */}
                  {imageQueue.length > 0 && (
                    <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-yellow-200 font-medium">
                            {imageQueue.length} imagem(ns) na fila
                          </div>
                          <div className="text-yellow-300 text-sm mt-1">
                            Próxima: {imageQueue[0].prompt.substring(0, 40)}...
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Erro de geração */}
                  {imageGenerationError && (
                    <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                        <div className="text-red-200">{imageGenerationError}</div>
                      </div>
                    </div>
                  )}

                  {/* Galeria */}
                  <div className="bg-gray-800 border border-gray-700 rounded-lg">
                    <div className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <ImageIcon className="h-6 w-6 text-purple-500" />
                        <h3 className="text-xl font-semibold text-white">Galeria de Imagens</h3>
                        {generatedImages.length > 0 && (
                          <span className="bg-purple-600 text-white px-2 py-1 rounded text-xs">
                            {generatedImages.length} imagens
                          </span>
                        )}
                      </div>

                      {generatedImages.length === 0 ? (
                        <div className="text-center py-12">
                          <ImageIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                          <p className="text-gray-400 mb-2">Nenhuma imagem gerada ainda</p>
                          <p className="text-sm text-gray-500">
                            Digite um prompt e clique em "Gerar Imagem" para começar
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                          {generatedImages.map((image, index) => (
                            <div key={image.id} className="bg-gray-700 rounded-lg overflow-hidden">
                              <div className="aspect-video relative">
                                <img
                                  src={image.url}
                                  alt={image.prompt}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                                <div className="absolute top-2 right-2 flex space-x-1">
                                  <button
                                    onClick={() => {
                                      const link = document.createElement('a');
                                      link.href = image.url;
                                      link.download = `ai_image_${image.id}.png`;
                                      document.body.appendChild(link);
                                      link.click();
                                      document.body.removeChild(link);
                                    }}
                                    className="bg-black/50 hover:bg-black/70 text-white p-1 rounded"
                                    title="Download"
                                  >
                                    <Download className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(image.url);
                                    }}
                                    className="bg-black/50 hover:bg-black/70 text-white p-1 rounded"
                                    title="Copiar URL"
                                  >
                                    <Copy className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                              <div className="p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded">
                                    {image.service.toUpperCase()}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    {new Date(image.timestamp).toLocaleString()}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-300 line-clamp-2">
                                  {image.prompt}
                                </p>
                                <div className="text-xs text-gray-400 mt-1">
                                  {image.settings.width}x{image.settings.height}
                                  {image.settings.model && ` • ${image.settings.model}`}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'configuracoes':
        return (
          <div className="p-8">
            <div className="max-w-6xl mx-auto">
              <div className="mb-8">
                <div className="flex items-center space-x-3 mb-4">
                  <Settings className="h-8 w-8 text-red-500" />
                  <h1 className="text-3xl font-bold text-white">Configurações de APIs</h1>
                </div>
                <p className="text-gray-400">Configure suas chaves de API para scraping, IA e outras ferramentas</p>
              </div>

              {/* Scraping APIs */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg mb-6">
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <Search className="h-6 w-6 text-blue-500" />
                    <h2 className="text-xl font-semibold text-white">APIs de Scraping</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* RapidAPI YouTube V2 */}
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <Video className="h-5 w-5 text-red-500" />
                        <h3 className="font-semibold text-white">RapidAPI YouTube V2</h3>
                        <span className="text-xs bg-red-600 text-white px-2 py-1 rounded">Principal</span>
                      </div>
                      <p className="text-sm text-gray-400 mb-3">API principal para extração de dados do YouTube</p>
                      <div className="relative mb-3">
                        <input
                          type={showApiKeys['rapidapi_youtube'] ? "text" : "password"}
                          placeholder="Cole sua chave RapidAPI YouTube V2..."
                          className="w-full bg-gray-600 border border-gray-500 text-white px-3 py-2 rounded-md pr-10"
                          value={apiKeys['rapidapi_youtube'] || ''}
                          onChange={(e) => setApiKeys(prev => ({...prev, 'rapidapi_youtube': e.target.value}))}
                          onBlur={(e) => {
                            if (e.target.value.trim()) {
                              updateApiConfig('rapidapi_youtube', e.target.value.trim());
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="absolute right-0 top-0 h-full px-3 py-2"
                          onClick={() => setShowApiKeys(prev => ({...prev, 'rapidapi_youtube': !prev['rapidapi_youtube']}))}
                        >
                          {showApiKeys['rapidapi_youtube'] ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {apiValidation['rapidapi_youtube'] && (
                        <div className="flex items-center space-x-2">
                          {apiValidation['rapidapi_youtube'] === 'validating' && (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
                              <span className="text-yellow-500 text-sm">Validando...</span>
                            </>
                          )}
                          {apiValidation['rapidapi_youtube'] === 'valid' && (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-green-500 text-sm">Chave válida</span>
                            </>
                          )}
                          {apiValidation['rapidapi_youtube'] === 'invalid' && (
                            <>
                              <AlertCircle className="h-4 w-4 text-red-500" />
                              <span className="text-red-500 text-sm">Chave inválida</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Outras APIs de Scraping */}
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <BarChart3 className="h-5 w-5 text-purple-500" />
                        <h3 className="font-semibold text-white">Outras APIs de Scraping</h3>
                        <span className="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded">Futuro</span>
                      </div>
                      <p className="text-sm text-gray-400 mb-3">APIs alternativas para scraping de dados</p>
                      <div className="space-y-2 text-sm text-gray-500">
                        <div>• ScrapingBee API</div>
                        <div>• Apify YouTube Scraper</div>
                        <div>• Custom Scraping Solutions</div>
                        <div className="text-xs text-gray-600 mt-2">Em desenvolvimento...</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI APIs */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg mb-6">
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <Wand2 className="h-6 w-6 text-purple-500" />
                    <h2 className="text-xl font-semibold text-white">APIs de Inteligência Artificial</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* ChatGPT */}
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <Lightbulb className="h-5 w-5 text-green-500" />
                        <h3 className="font-semibold text-white">OpenAI ChatGPT</h3>
                      </div>
                      <p className="text-sm text-gray-400 mb-3">Para geração de títulos, roteiros e conteúdo</p>
                      <div className="relative mb-3">
                        <input
                          type={showApiKeys['openai'] ? "text" : "password"}
                          placeholder="sk-..."
                          className="w-full bg-gray-600 border border-gray-500 text-white px-3 py-2 rounded-md pr-10"
                          value={apiKeys['openai'] || ''}
                          onChange={(e) => setApiKeys(prev => ({...prev, 'openai': e.target.value}))}
                          onBlur={(e) => {
                            if (e.target.value.trim()) {
                              updateApiConfig('openai', e.target.value.trim());
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="absolute right-0 top-0 h-full px-3 py-2"
                          onClick={() => setShowApiKeys(prev => ({...prev, 'openai': !prev['openai']}))}
                        >
                          {showApiKeys['openai'] ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {apiValidation['openai'] && (
                        <div className="flex items-center space-x-2">
                          {apiValidation['openai'] === 'validating' && (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
                              <span className="text-yellow-500 text-sm">Validando...</span>
                            </>
                          )}
                          {apiValidation['openai'] === 'valid' && (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-green-500 text-sm">Chave válida</span>
                            </>
                          )}
                          {apiValidation['openai'] === 'invalid' && (
                            <>
                              <AlertCircle className="h-4 w-4 text-red-500" />
                              <span className="text-red-500 text-sm">Chave inválida</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Claude */}
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <BookOpen className="h-5 w-5 text-orange-500" />
                        <h3 className="font-semibold text-white">Anthropic Claude</h3>
                      </div>
                      <p className="text-sm text-gray-400 mb-3">IA avançada para análise e criação de conteúdo</p>
                      <div className="relative mb-3">
                        <input
                          type={showApiKeys['claude'] ? "text" : "password"}
                          placeholder="sk-ant-..."
                          className="w-full bg-gray-600 border border-gray-500 text-white px-3 py-2 rounded-md pr-10"
                          value={apiKeys['claude'] || ''}
                          onChange={(e) => setApiKeys(prev => ({...prev, 'claude': e.target.value}))}
                          onBlur={(e) => {
                            if (e.target.value.trim()) {
                              updateApiConfig('claude', e.target.value.trim());
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="absolute right-0 top-0 h-full px-3 py-2"
                          onClick={() => setShowApiKeys(prev => ({...prev, 'claude': !prev['claude']}))}
                        >
                          {showApiKeys['claude'] ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {apiValidation['claude'] && (
                        <div className="flex items-center space-x-2">
                          {apiValidation['claude'] === 'validating' && (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
                              <span className="text-yellow-500 text-sm">Validando...</span>
                            </>
                          )}
                          {apiValidation['claude'] === 'valid' && (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-green-500 text-sm">Chave válida</span>
                            </>
                          )}
                          {apiValidation['claude'] === 'invalid' && (
                            <>
                              <AlertCircle className="h-4 w-4 text-red-500" />
                              <span className="text-red-500 text-sm">Chave inválida</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* OpenRouter */}
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <Link className="h-5 w-5 text-blue-500" />
                        <h3 className="font-semibold text-white">OpenRouter</h3>
                      </div>
                      <p className="text-sm text-gray-400 mb-3">Acesso a múltiplos modelos de IA</p>
                      <div className="relative mb-3">
                        <input
                          type={showApiKeys['openrouter'] ? "text" : "password"}
                          placeholder="sk-or-..."
                          className="w-full bg-gray-600 border border-gray-500 text-white px-3 py-2 rounded-md pr-10"
                          value={apiKeys['openrouter'] || ''}
                          onChange={(e) => setApiKeys(prev => ({...prev, 'openrouter': e.target.value}))}
                          onBlur={(e) => {
                            if (e.target.value.trim()) {
                              updateApiConfig('openrouter', e.target.value.trim());
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="absolute right-0 top-0 h-full px-3 py-2"
                          onClick={() => setShowApiKeys(prev => ({...prev, 'openrouter': !prev['openrouter']}))}
                        >
                          {showApiKeys['openrouter'] ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {apiValidation['openrouter'] && (
                        <div className="flex items-center space-x-2">
                          {apiValidation['openrouter'] === 'validating' && (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
                              <span className="text-yellow-500 text-sm">Validando...</span>
                            </>
                          )}
                          {apiValidation['openrouter'] === 'valid' && (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-green-500 text-sm">Chave válida</span>
                            </>
                          )}
                          {apiValidation['openrouter'] === 'invalid' && (
                            <>
                              <AlertCircle className="h-4 w-4 text-red-500" />
                              <span className="text-red-500 text-sm">Chave inválida</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Gemini */}
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <Volume2 className="h-5 w-5 text-red-500" />
                        <h3 className="font-semibold text-white">Google Gemini</h3>
                        <span className="text-xs bg-red-600 text-white px-2 py-1 rounded">TTS</span>
                      </div>
                      <p className="text-sm text-gray-400 mb-3">IA do Google para análise, geração e síntese de voz (TTS)</p>
                      <div className="relative mb-3">
                        <input
                          type={showApiKeys['gemini'] ? "text" : "password"}
                          placeholder="AIza..."
                          className="w-full bg-gray-600 border border-gray-500 text-white px-3 py-2 rounded-md pr-10"
                          value={apiKeys['gemini'] || ''}
                          onChange={(e) => setApiKeys(prev => ({...prev, 'gemini': e.target.value}))}
                          onBlur={(e) => {
                            if (e.target.value.trim()) {
                              updateApiConfig('gemini', e.target.value.trim());
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="absolute right-0 top-0 h-full px-3 py-2"
                          onClick={() => setShowApiKeys(prev => ({...prev, 'gemini': !prev['gemini']}))}
                        >
                          {showApiKeys['gemini'] ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {apiValidation['gemini'] && (
                        <div className="flex items-center space-x-2">
                          {apiValidation['gemini'] === 'validating' && (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
                              <span className="text-yellow-500 text-sm">Validando...</span>
                            </>
                          )}
                          {apiValidation['gemini'] === 'valid' && (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-green-500 text-sm">Chave válida</span>
                            </>
                          )}
                          {apiValidation['gemini'] === 'invalid' && (
                            <>
                              <AlertCircle className="h-4 w-4 text-red-500" />
                              <span className="text-red-500 text-sm">Chave inválida</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Stability AI */}
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <ImageIcon className="h-5 w-5 text-pink-500" />
                        <h3 className="font-semibold text-white">Stability AI</h3>
                        <span className="text-xs bg-pink-600 text-white px-2 py-1 rounded">IMAGENS</span>
                      </div>
                      <p className="text-sm text-gray-400 mb-3">IA avançada para geração de imagens e arte digital</p>
                      <div className="relative mb-3">
                        <input
                          type={showApiKeys['stability'] ? "text" : "password"}
                          placeholder="sk-..."
                          className="w-full bg-gray-600 border border-gray-500 text-white px-3 py-2 rounded-md pr-10"
                          value={apiKeys['stability'] || ''}
                          onChange={(e) => setApiKeys(prev => ({...prev, 'stability': e.target.value}))}
                          onBlur={(e) => {
                            if (e.target.value.trim()) {
                              updateApiConfig('stability', e.target.value.trim());
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="absolute right-0 top-0 h-full px-3 py-2"
                          onClick={() => setShowApiKeys(prev => ({...prev, 'stability': !prev['stability']}))}
                        >
                          {showApiKeys['stability'] ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {apiValidation['stability'] && (
                        <div className="flex items-center space-x-2">
                          {apiValidation['stability'] === 'validating' && (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
                              <span className="text-yellow-500 text-sm">Validando...</span>
                            </>
                          )}
                          {apiValidation['stability'] === 'valid' && (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-green-500 text-sm">Chave válida</span>
                            </>
                          )}
                          {apiValidation['stability'] === 'invalid' && (
                            <>
                              <AlertCircle className="h-4 w-4 text-red-500" />
                              <span className="text-red-500 text-sm">Chave inválida</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Together.ai */}
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <ImageIcon className="h-5 w-5 text-cyan-500" />
                        <h3 className="font-semibold text-white">Together.ai</h3>
                        <span className="text-xs bg-cyan-600 text-white px-2 py-1 rounded">IMAGENS</span>
                      </div>
                      <p className="text-sm text-gray-400 mb-3">FLUX.1-schnell gratuito para geração de imagens</p>
                      <div className="relative mb-3">
                        <input
                          type={showApiKeys['together'] ? "text" : "password"}
                          placeholder="Cole sua chave da API Together.ai..."
                          className="w-full bg-gray-600 border border-gray-500 text-white px-3 py-2 rounded-md pr-10"
                          value={apiKeys['together'] || ''}
                          onChange={(e) => setApiKeys(prev => ({...prev, 'together': e.target.value}))}
                          onBlur={(e) => {
                            if (e.target.value.trim()) {
                              updateApiConfig('together', e.target.value.trim());
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="absolute right-0 top-0 h-full px-3 py-2"
                          onClick={() => setShowApiKeys(prev => ({...prev, 'together': !prev['together']}))}
                        >
                          {showApiKeys['together'] ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {apiValidation['together'] && (
                        <div className="flex items-center space-x-2">
                          {apiValidation['together'] === 'validating' && (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
                              <span className="text-yellow-500 text-sm">Validando...</span>
                            </>
                          )}
                          {apiValidation['together'] === 'valid' && (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-green-500 text-sm">Chave válida</span>
                            </>
                          )}
                          {apiValidation['together'] === 'invalid' && (
                            <>
                              <AlertCircle className="h-4 w-4 text-red-500" />
                              <span className="text-red-500 text-sm">Chave inválida</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Audio APIs */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg mb-6">
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <Mic className="h-6 w-6 text-purple-500" />
                    <h2 className="text-xl font-semibold text-white">APIs de Áudio (Text-to-Speech)</h2>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* ElevenLabs */}
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <Mic className="h-5 w-5 text-purple-500" />
                        <h3 className="font-semibold text-white">ElevenLabs</h3>
                        <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded">Premium</span>
                      </div>
                      <p className="text-sm text-gray-400 mb-3">Melhor qualidade de voz sintética disponível</p>
                      <div className="relative mb-3">
                        <input
                          type={showApiKeys['elevenlabs'] ? "text" : "password"}
                          placeholder="Cole sua chave ElevenLabs..."
                          className="w-full bg-gray-600 border border-gray-500 text-white px-3 py-2 rounded-md pr-10"
                          value={apiKeys['elevenlabs'] || ''}
                          onChange={(e) => setApiKeys(prev => ({...prev, 'elevenlabs': e.target.value}))}
                          onBlur={(e) => {
                            if (e.target.value.trim()) {
                              updateApiConfig('elevenlabs', e.target.value.trim());
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="absolute right-0 top-0 h-full px-3 py-2"
                          onClick={() => setShowApiKeys(prev => ({...prev, 'elevenlabs': !prev['elevenlabs']}))}
                        >
                          {showApiKeys['elevenlabs'] ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {apiValidation['elevenlabs'] && (
                        <div className="flex items-center space-x-2">
                          {apiValidation['elevenlabs'] === 'validating' && (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
                              <span className="text-yellow-500 text-sm">Validando...</span>
                            </>
                          )}
                          {apiValidation['elevenlabs'] === 'valid' && (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-green-500 text-sm">Chave válida</span>
                            </>
                          )}
                          {apiValidation['elevenlabs'] === 'invalid' && (
                            <>
                              <AlertCircle className="h-4 w-4 text-red-500" />
                              <span className="text-red-500 text-sm">Chave inválida</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Azure Speech */}
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <Mic className="h-5 w-5 text-blue-500" />
                        <h3 className="font-semibold text-white">Azure Speech</h3>
                        <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">Pago</span>
                      </div>
                      <p className="text-sm text-gray-400 mb-3">Serviço de TTS da Microsoft com vozes neurais</p>
                      <div className="relative mb-3">
                        <input
                          type={showApiKeys['azure'] ? "text" : "password"}
                          placeholder="Cole sua chave Azure Speech..."
                          className="w-full bg-gray-600 border border-gray-500 text-white px-3 py-2 rounded-md pr-10"
                          value={apiKeys['azure'] || ''}
                          onChange={(e) => setApiKeys(prev => ({...prev, 'azure': e.target.value}))}
                          onBlur={(e) => {
                            if (e.target.value.trim()) {
                              updateApiConfig('azure', e.target.value.trim());
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="absolute right-0 top-0 h-full px-3 py-2"
                          onClick={() => setShowApiKeys(prev => ({...prev, 'azure': !prev['azure']}))}
                        >
                          {showApiKeys['azure'] ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {apiValidation['azure'] && (
                        <div className="flex items-center space-x-2">
                          {apiValidation['azure'] === 'validating' && (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
                              <span className="text-yellow-500 text-sm">Validando...</span>
                            </>
                          )}
                          {apiValidation['azure'] === 'valid' && (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-green-500 text-sm">Chave válida</span>
                            </>
                          )}
                          {apiValidation['azure'] === 'invalid' && (
                            <>
                              <AlertCircle className="h-4 w-4 text-red-500" />
                              <span className="text-red-500 text-sm">Chave inválida</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* AWS Polly */}
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <Mic className="h-5 w-5 text-orange-500" />
                        <h3 className="font-semibold text-white">AWS Polly</h3>
                        <span className="text-xs bg-orange-600 text-white px-2 py-1 rounded">Pago</span>
                      </div>
                      <p className="text-sm text-gray-400 mb-3">Serviço de TTS da Amazon Web Services</p>
                      <div className="relative mb-3">
                        <input
                          type={showApiKeys['aws'] ? "text" : "password"}
                          placeholder="Cole sua chave AWS..."
                          className="w-full bg-gray-600 border border-gray-500 text-white px-3 py-2 rounded-md pr-10"
                          value={apiKeys['aws'] || ''}
                          onChange={(e) => setApiKeys(prev => ({...prev, 'aws': e.target.value}))}
                          onBlur={(e) => {
                            if (e.target.value.trim()) {
                              updateApiConfig('aws', e.target.value.trim());
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="absolute right-0 top-0 h-full px-3 py-2"
                          onClick={() => setShowApiKeys(prev => ({...prev, 'aws': !prev['aws']}))}
                        >
                          {showApiKeys['aws'] ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {apiValidation['aws'] && (
                        <div className="flex items-center space-x-2">
                          {apiValidation['aws'] === 'validating' && (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
                              <span className="text-yellow-500 text-sm">Validando...</span>
                            </>
                          )}
                          {apiValidation['aws'] === 'valid' && (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-green-500 text-sm">Chave válida</span>
                            </>
                          )}
                          {apiValidation['aws'] === 'invalid' && (
                            <>
                              <AlertCircle className="h-4 w-4 text-red-500" />
                              <span className="text-red-500 text-sm">Chave inválida</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Google TTS */}
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <Mic className="h-5 w-5 text-green-500" />
                        <h3 className="font-semibold text-white">Google Text-to-Speech</h3>
                        <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">Freemium</span>
                      </div>
                      <p className="text-sm text-gray-400 mb-3">Serviço de TTS do Google Cloud</p>
                      <div className="relative mb-3">
                        <input
                          type={showApiKeys['google'] ? "text" : "password"}
                          placeholder="Cole sua chave Google Cloud..."
                          className="w-full bg-gray-600 border border-gray-500 text-white px-3 py-2 rounded-md pr-10"
                          value={apiKeys['google'] || ''}
                          onChange={(e) => setApiKeys(prev => ({...prev, 'google': e.target.value}))}
                          onBlur={(e) => {
                            if (e.target.value.trim()) {
                              updateApiConfig('google', e.target.value.trim());
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="absolute right-0 top-0 h-full px-3 py-2"
                          onClick={() => setShowApiKeys(prev => ({...prev, 'google': !prev['google']}))}
                        >
                          {showApiKeys['google'] ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {apiValidation['google'] && (
                        <div className="flex items-center space-x-2">
                          {apiValidation['google'] === 'validating' && (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
                              <span className="text-yellow-500 text-sm">Validando...</span>
                            </>
                          )}
                          {apiValidation['google'] === 'valid' && (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-green-500 text-sm">Chave válida</span>
                            </>
                          )}
                          {apiValidation['google'] === 'invalid' && (
                            <>
                              <AlertCircle className="h-4 w-4 text-red-500" />
                              <span className="text-red-500 text-sm">Chave inválida</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Serviços Gratuitos */}
                  <div className="mt-6 p-4 bg-gray-900/50 rounded-lg">
                    <h4 className="text-white font-medium mb-2">Serviços Gratuitos (Sem API necessária)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-gray-300">Microsoft Edge TTS</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-gray-300">Coqui TTS (Local)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-gray-300">Kokoro TTS</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Estes serviços não requerem chaves de API e podem ser usados gratuitamente.
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Summary */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Resumo das Configurações</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-500 mb-2">
                        {Object.values(apiValidation).filter(status => status === 'valid').length}
                      </div>
                      <div className="text-sm text-gray-400">APIs Configuradas</div>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="text-2xl font-bold text-yellow-500 mb-2">
                        {Object.values(apiValidation).filter(status => status === 'validating').length}
                      </div>
                      <div className="text-sm text-gray-400">Validando</div>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="text-2xl font-bold text-red-500 mb-2">
                        {Object.values(apiValidation).filter(status => status === 'invalid').length}
                      </div>
                      <div className="text-sm text-gray-400">Com Erro</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="p-8">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl font-bold text-white">Página não encontrada</h1>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold text-white">YouTube Script</h1>
          <span className="text-red-500 font-bold">Composer</span>
        </div>
        
        <nav className="flex-1 px-4">
          <div className="space-y-2">
            <button
              onClick={() => setActiveTab('inicio')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                activeTab === 'inicio'
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Home className="h-5 w-5" />
              <span>1. Início</span>
            </button>

            <button
              onClick={() => setActiveTab('pesquisa')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                activeTab === 'pesquisa'
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Search className="h-5 w-5" />
              <span>2. Pesquisa</span>
            </button>

            <button
              onClick={() => setActiveTab('titulos')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                activeTab === 'titulos'
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Wand2 className="h-5 w-5" />
              <span>3. Títulos</span>
            </button>

            <button
              onClick={() => setActiveTab('premissas')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                activeTab === 'premissas'
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Lightbulb className="h-5 w-5" />
              <span>4. Premissas</span>
            </button>

            <button
              onClick={() => setActiveTab('roteiros')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                activeTab === 'roteiros'
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <BookOpen className="h-5 w-5" />
              <span>5. Roteiros</span>
            </button>

            <button
              onClick={() => setActiveTab('audio')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                activeTab === 'audio'
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Mic className="h-5 w-5" />
              <span>6. Áudio</span>
            </button>

            <button
              onClick={() => setActiveTab('gemini-audio')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                activeTab === 'gemini-audio'
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Volume2 className="h-5 w-5" />
              <span>7. Gemini TTS</span>
            </button>

            <button
              onClick={() => setActiveTab('image-generation')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                activeTab === 'image-generation'
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <ImageIcon className="h-5 w-5" />
              <span>8. Geração de Imagens</span>
            </button>

            {/* Submenu de Áudio */}
            {activeTab === 'audio' && (
              <div className="ml-6 space-y-1">
                <button
                  onClick={() => setActiveTab('audio-test')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors text-sm ${
                    activeTab === 'audio-test'
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-500 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <TestTube className="h-4 w-4" />
                  <span>Teste de APIs</span>
                </button>
                <button
                  onClick={() => setActiveTab('audio-apis')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors text-sm ${
                    activeTab === 'audio-apis'
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-500 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <Settings className="h-4 w-4" />
                  <span>Configurar APIs</span>
                </button>
                <button
                  onClick={() => setActiveTab('gemini-tts')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors text-sm ${
                    activeTab === 'gemini-tts'
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-500 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <Volume2 className="h-4 w-4" />
                  <span>Teste Gemini TTS</span>
                </button>
              </div>
            )}

            <button
              onClick={() => setActiveTab('imagens')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                activeTab === 'imagens'
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <ImageIcon className="h-5 w-5" />
              <span>Imagens</span>
            </button>

            <div className="border-t border-gray-700 my-2"></div>
            
            <button
              onClick={() => setActiveTab('teste-rapidapi')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                activeTab === 'teste-rapidapi'
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <TestTube className="h-5 w-5" />
              <span>Teste RapidAPI</span>
            </button>
            
            <button
              onClick={() => setActiveTab('configuracoes')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                activeTab === 'configuracoes'
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Settings className="h-5 w-5" />
              <span>Configurações</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {renderContent()}
      </div>
    </div>
  );
}

export default App;
