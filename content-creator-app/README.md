# 🎬 Content Creator App - Criador de Conteúdo com IA

Uma aplicação completa e moderna para criação de conteúdo usando IA, com funcionalidades avançadas para extração de dados do YouTube, geração de títulos, roteiros, áudio e imagens de alta qualidade.

## 🚀 Funcionalidades Principais

### 📺 **Extração e Análise de Conteúdo**
- **YouTube Channel Scraping** - Extrai dados completos de canais
- **Análise de Vídeos** - Processa metadados e informações
- **Extração de Títulos** - Coleta títulos para análise de tendências

### 🤖 **Geração Inteligente com IA**
- **Títulos Otimizados** - OpenAI GPT-4, Claude, Gemini
- **Roteiros Estruturados** - Capítulos organizados com reviravoltas
- **Premissas Criativas** - Desenvolvimento de conceitos únicos

### 🎵 **Síntese de Áudio Avançada (TTS)**
- **Gemini TTS** - 30 vozes do Google com sistema de rotação de APIs
- **ElevenLabs** - Vozes premium de alta qualidade
- **Edge TTS** - Serviço gratuito da Microsoft
- **Coqui TTS** - IA open-source para síntese de voz
- **Geração por segmentos** para roteiros longos

### 🎨 **Geração de Imagens com IA (7 Serviços)**
#### **🆓 Gratuitos:**
- **Pollinations AI** - Modelos Flux avançados
- **Together.ai FLUX** - FLUX.1-schnell de alta qualidade
- **Lorem Picsum** - Fotos reais aleatórias
- **Unsplash Source** - Fotos HD profissionais

#### **💎 Premium:**
- **DALL-E 3** - IA da OpenAI
- **Gemini Imagen** - IA do Google
- **Stability AI** - Modelos avançados

### 🔄 **Sistema de Rotação de APIs Gemini**
- **Múltiplas APIs** - Configure até 10 chaves do Gemini
- **Rotação Automática** - Troca automaticamente quando atinge limite
- **Monitoramento em Tempo Real** - Vê uso atual de cada API
- **Aumento de Limite** - De ~1000 para ~10000 requests/dia

### 🎯 **Sistema de Fila Inteligente**
- **Geração Sequencial** - Evita conflitos entre múltiplas gerações
- **Status Visual** - Mostra progresso e fila em tempo real
- **Processamento Automático** - Processa próximo item automaticamente

### ⚙️ **Gerenciamento Avançado de APIs**
- **Configuração Segura** - Chaves criptografadas no backend
- **Validação Automática** - Teste em tempo real das chaves
- **Status Monitoring** - Indicadores visuais detalhados
- **15+ APIs Integradas** - YouTube, OpenAI, Gemini, Claude, ElevenLabs, Together.ai, etc.
- **Rate Limiting**: Controle de uso para evitar custos excessivos

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18** - Interface de usuário moderna
- **Tailwind CSS** - Estilização responsiva
- **shadcn/ui** - Componentes de interface
- **Lucide Icons** - Ícones modernos
- **Vite** - Build tool e dev server

### Backend
- **Flask** - API REST
- **SQLAlchemy** - ORM para banco de dados
- **SQLite** - Banco de dados
- **Cryptography** - Criptografia de chaves de API
- **Flask-CORS** - Suporte a CORS

### APIs Integradas
- **YouTube Data API** (Gratuita) - Extração de conteúdo
- **OpenAI API** (Paga) - Geração de texto
- **ElevenLabs** (Paga) - Síntese de voz
- **Replicate** (Paga) - Geração de imagens
- **Runway ML** (Paga) - Edição de vídeo

## 📦 Instalação e Configuração

### Pré-requisitos
- Python 3.11+
- Node.js 20+
- pnpm

### 1. Clone o Repositório
```bash
git clone <https://github.com/Ender-ss/youtubeaap.git>
cd content-creator-app
```

### 2. Configuração do Backend
```bash
cd backend
python -m venv venvS
source venv/bin/activate  # Linux/Mac
# ou
venv\\Scripts\\activate  # Windows

pip install -r requirements.txt
```

### 3. Configuração do Frontend
```bash
cd frontend
pnpm install
```

## 🚀 Como Executar

### 1. Iniciar o Backend
```bash
cd backend
source venv/bin/activate
python src/main.py
```
O backend estará disponível em: `http://localhost:5000`

### 2. Iniciar o Frontend
```bash
cd frontend
pnpm run dev --host
```
O frontend estará disponível em: `http://localhost:5173`

## ⚙️ Configuração de APIs

### 1. Acesse a Configuração
- Abra o aplicativo no navegador
- Clique em "Configurar APIs" no cabeçalho

### 2. Configure as APIs Necessárias

#### YouTube Data API (Obrigatória - Gratuita)
1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um projeto ou selecione um existente
3. Ative a YouTube Data API v3
4. Crie credenciais (API Key)
5. Cole a chave no aplicativo

#### OpenAI API (Obrigatória - Paga)
1. Acesse [OpenAI Platform](https://platform.openai.com/)
2. Crie uma conta e adicione créditos
3. Gere uma API key
4. Cole a chave no aplicativo

#### ElevenLabs (Opcional - Paga)
1. Acesse [ElevenLabs](https://elevenlabs.io/)
2. Crie uma conta
3. Gere uma API key
4. Cole a chave no aplicativo

#### Replicate (Opcional - Paga)
1. Acesse [Replicate](https://replicate.com/)
2. Crie uma conta
3. Gere um token de API
4. Cole o token no aplicativo

## 📖 Como Usar

### 1. Extração de Conteúdo
- Cole a URL de um vídeo do YouTube
- Configure as opções de extração
- Clique em "Extrair e Processar Conteúdo"

### 2. Criação de Título
- Revise o título original extraído
- Ajuste o resumo se necessário
- Clique em "Gerar Título Sensacionalista"

### 3. Geração de Roteiro
- Configure as opções do roteiro
- Defina o número de capítulos (padrão: 10)
- Clique em "Gerar Roteiro Completo"

### 4. Próximas Etapas
- As etapas de síntese de voz, geração de imagens e edição de vídeo estão preparadas para implementação
- Configure as APIs correspondentes para ativar essas funcionalidades

## 🔒 Segurança

### Chaves de API
- **Criptografia**: Todas as chaves são criptografadas antes do armazenamento
- **Backend Only**: Chaves nunca são expostas no frontend
- **Validação**: Teste automático das chaves inseridas
- **Logs**: Registro de uso para auditoria

### Dados do Usuário
- **Armazenamento Local**: Dados ficam no dispositivo do usuário
- **Sem Coleta**: Nenhum dado pessoal é coletado
- **Limpeza Automática**: Opção de limpar dados automaticamente

## 📁 Estrutura do Projeto

```
content-creator-app/
├── backend/
│   ├── src/
│   │   ├── models/          # Modelos de dados
│   │   │   ├── user.py
│   │   │   └── api_config.py
│   │   ├── routes/          # Rotas da API
│   │   │   ├── user.py
│   │   │   ├── api_config.py
│   │   │   └── content_processor.py
│   │   ├── database/        # Banco de dados
│   │   └── main.py          # Arquivo principal
│   ├── venv/               # Ambiente virtual Python
│   └── requirements.txt    # Dependências Python
├── frontend/
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   │   └── ui/        # Componentes shadcn/ui
│   │   ├── App.jsx        # Componente principal
│   │   └── main.jsx       # Ponto de entrada
│   ├── public/            # Arquivos estáticos
│   └── package.json       # Dependências Node.js
└── README.md              # Este arquivo
```

## 🐛 Solução de Problemas

### Erro de CORS
- Certifique-se de que o backend está rodando na porta 5000
- Verifique se o proxy está configurado no `vite.config.js`

### APIs Não Funcionam
- Verifique se as chaves estão corretas
- Confirme se as APIs têm créditos suficientes
- Teste as chaves individualmente no aplicativo

### Erro de Banco de Dados
- Exclua o arquivo `backend/src/database/app.db`
- Reinicie o backend para recriar o banco

## 🔄 Atualizações Futuras

### Funcionalidades Planejadas
- [ ] Implementação completa da síntese de voz
- [ ] Geração de imagens com múltiplos modelos
- [ ] Editor de vídeo integrado
- [ ] Sistema de templates
- [ ] Exportação em múltiplos formatos
- [ ] Integração com redes sociais
- [ ] Dashboard de analytics

### Melhorias Técnicas
- [ ] Testes automatizados
- [ ] Docker para deployment
- [ ] CI/CD pipeline
- [ ] Monitoramento de performance
- [ ] Cache de resultados

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

Para suporte e dúvidas:
- Abra uma issue no GitHub
- Consulte a documentação das APIs utilizadas
- Verifique os logs do backend para debugging

---

**Desenvolvido com ❤️ para criadores de conteúdo**

