import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { WeatherAgent, ChatMessage } from './agent.js';

// Environment variables yükle
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Agent instance
const agent = new WeatherAgent({
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  mcpServerUrl: process.env.MCP_SERVER_URL
});

// Conversation history (basit in-memory storage)
const conversations: Map<string, ChatMessage[]> = new Map();

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'augment-weather-agent'
  });
});

/**
 * Agent bilgileri
 */
app.get('/info', (req, res) => {
  res.json({
    name: 'Augment Weather Agent',
    version: '1.0.0',
    description: 'Hava durumu MCP server\'ını kullanan akıllı agent',
    capabilities: [
      'Güncel hava durumu sorgulama',
      '7 günlük hava durumu tahmini',
      'Dünya çapında şehir desteği',
      'Türkçe ve İngilizce dil desteği',
      'Doğal dil işleme'
    ],
    endpoints: {
      '/chat': 'POST - Agent ile sohbet et',
      '/weather/current': 'GET - Direkt hava durumu al',
      '/weather/forecast': 'GET - Direkt 7 günlük tahmin al',
      '/test': 'GET - MCP bağlantısını test et'
    }
  });
});

/**
 * Chat endpoint - Ana agent etkileşimi
 */
app.post('/chat', async (req, res) => {
  try {
    const { message, sessionId = 'default' } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        error: 'Mesaj gerekli ve string olmalı'
      });
    }

    // Conversation history al
    const history = conversations.get(sessionId) || [];

    // Agent'a mesaj gönder
    const response = await agent.processMessage(message, history);

    // History güncelle
    const updatedHistory = [
      ...history,
      { role: 'user' as const, content: message },
      { role: 'assistant' as const, content: response.message }
    ];
    
    // Son 20 mesajı sakla
    if (updatedHistory.length > 20) {
      updatedHistory.splice(0, updatedHistory.length - 20);
    }
    
    conversations.set(sessionId, updatedHistory);

    res.json({
      message: response.message,
      weatherData: response.weatherData,
      error: response.error,
      sessionId: sessionId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: 'Sunucu hatası',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
});

/**
 * Direkt hava durumu endpoint
 */
app.get('/weather/current', async (req, res) => {
  try {
    const { city } = req.query;

    if (!city || typeof city !== 'string') {
      return res.status(400).json({
        error: 'city parametresi gerekli'
      });
    }

    const response = await agent.processMessage(`${city} hava durumu`);

    res.json({
      city: city,
      data: response.weatherData,
      message: response.message,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Weather error:', error);
    res.status(500).json({
      error: 'Hava durumu alınamadı',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
});

/**
 * Direkt 7 günlük tahmin endpoint
 */
app.get('/weather/forecast', async (req, res) => {
  try {
    const { city } = req.query;

    if (!city || typeof city !== 'string') {
      return res.status(400).json({
        error: 'city parametresi gerekli'
      });
    }

    const response = await agent.processMessage(`${city} 7 günlük tahmin`);

    res.json({
      city: city,
      data: response.weatherData,
      message: response.message,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Forecast error:', error);
    res.status(500).json({
      error: 'Tahmin alınamadı',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
});

/**
 * MCP bağlantı testi
 */
app.get('/test', async (req, res) => {
  try {
    const isConnected = await agent.testConnection();
    
    res.json({
      mcpConnection: isConnected,
      message: isConnected ? 'MCP server bağlantısı başarılı' : 'MCP server bağlantısı başarısız',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Test error:', error);
    res.status(500).json({
      mcpConnection: false,
      error: 'Test başarısız',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
});

/**
 * Conversation history temizle
 */
app.delete('/chat/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  conversations.delete(sessionId);
  
  res.json({
    message: `Session ${sessionId} temizlendi`,
    timestamp: new Date().toISOString()
  });
});

/**
 * 404 handler
 */
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint bulunamadı',
    availableEndpoints: [
      'GET /health',
      'GET /info', 
      'POST /chat',
      'GET /weather/current?city=<city>',
      'GET /weather/forecast?city=<city>',
      'GET /test',
      'DELETE /chat/:sessionId'
    ]
  });
});

/**
 * Error handler
 */
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Sunucu hatası',
    details: error.message || 'Bilinmeyen hata'
  });
});

/**
 * Server başlat
 */
app.listen(port, () => {
  console.log(`🤖 Augment Weather Agent running on port ${port}`);
  console.log(`📡 Health check: http://localhost:${port}/health`);
  console.log(`ℹ️  Info: http://localhost:${port}/info`);
  console.log(`💬 Chat: POST http://localhost:${port}/chat`);
  console.log(`🌤️  Weather: GET http://localhost:${port}/weather/current?city=istanbul`);
  console.log(`📅 Forecast: GET http://localhost:${port}/weather/forecast?city=paris`);
  console.log(`🔧 Test: http://localhost:${port}/test`);
});

export default app;
