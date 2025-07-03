import Anthropic from '@anthropic-ai/sdk';
import { WeatherMCPClient } from './mcp-client.js';

export interface AgentConfig {
  anthropicApiKey?: string;
  mcpServerUrl?: string;
  systemPrompt?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AgentResponse {
  message: string;
  weatherData?: any;
  error?: string;
}

export class WeatherAgent {
  private anthropic: Anthropic | null = null;
  private mcpClient: WeatherMCPClient;
  private systemPrompt: string;

  constructor(config: AgentConfig = {}) {
    // Anthropic client (isteğe bağlı)
    if (config.anthropicApiKey) {
      this.anthropic = new Anthropic({
        apiKey: config.anthropicApiKey,
      });
    }

    // MCP client
    this.mcpClient = new WeatherMCPClient(config.mcpServerUrl);

    // System prompt
    this.systemPrompt = config.systemPrompt || `Sen hava durumu konusunda uzman bir asistansın. 
Kullanıcıların hava durumu sorularını yanıtlamak için MCP server'ını kullanıyorsun.

Yeteneklerin:
1. Herhangi bir şehrin güncel hava durumunu öğrenebilirsin
2. 7 günlük hava durumu tahminini verebilirsin
3. Hava durumu verilerini anlaşılır şekilde açıklayabilirsin
4. Türkçe ve İngilizce destekliyorsun

Kullanıcı bir şehir adı verdiğinde, MCP server'ını kullanarak o şehrin hava durumunu al ve kullanıcıya dostça bir şekilde sun.`;
  }

  /**
   * Kullanıcı mesajını işle ve yanıt ver
   */
  async processMessage(userMessage: string, conversationHistory: ChatMessage[] = []): Promise<AgentResponse> {
    try {
      // Hava durumu sorgusu mu kontrol et
      const weatherQuery = this.extractWeatherQuery(userMessage);
      
      if (weatherQuery) {
        // MCP server'dan hava durumu al
        const weatherData = await this.getWeatherData(weatherQuery);
        
        // AI ile yanıt oluştur (varsa)
        if (this.anthropic) {
          const aiResponse = await this.generateAIResponse(userMessage, weatherData, conversationHistory);
          return {
            message: aiResponse,
            weatherData: weatherData
          };
        } else {
          // AI yoksa basit yanıt
          return {
            message: this.formatSimpleResponse(weatherQuery, weatherData),
            weatherData: weatherData
          };
        }
      } else {
        // Hava durumu sorgusu değilse genel yanıt
        return {
          message: "Merhaba! Ben hava durumu asistanıyım. Size herhangi bir şehrin hava durumunu söyleyebilirim. Örneğin: 'İstanbul'un hava durumu nasıl?' veya 'Paris için 7 günlük tahmin ver' diyebilirsiniz."
        };
      }
    } catch (error) {
      return {
        message: "Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.",
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      };
    }
  }

  /**
   * Mesajdan hava durumu sorgusu çıkar
   */
  private extractWeatherQuery(message: string): { city: string; type: 'current' | 'forecast' } | null {
    const lowerMessage = message.toLowerCase();
    
    // Şehir adı bul (basit regex)
    const cityPatterns = [
      /(?:hava durumu|weather|tahmin|forecast).*?([a-zA-ZğüşıöçĞÜŞİÖÇ\s]+)/i,
      /([a-zA-ZğüşıöçĞÜŞİÖÇ\s]+).*?(?:hava durumu|weather|tahmin|forecast)/i,
      /^([a-zA-ZğüşıöçĞÜŞİÖÇ\s]+)$/i
    ];

    for (const pattern of cityPatterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        const city = match[1].trim();
        if (city.length > 2) {
          const type = lowerMessage.includes('tahmin') || lowerMessage.includes('forecast') || 
                      lowerMessage.includes('7 gün') || lowerMessage.includes('gelecek') ? 'forecast' : 'current';
          return { city, type };
        }
      }
    }

    return null;
  }

  /**
   * MCP server'dan hava durumu verisi al
   */
  private async getWeatherData(query: { city: string; type: 'current' | 'forecast' }): Promise<string> {
    if (query.type === 'forecast') {
      return await this.mcpClient.getDailyForecast(query.city);
    } else {
      return await this.mcpClient.getCurrentWeather(query.city);
    }
  }

  /**
   * AI ile yanıt oluştur
   */
  private async generateAIResponse(userMessage: string, weatherData: string, history: ChatMessage[]): Promise<string> {
    if (!this.anthropic) {
      throw new Error('Anthropic API key not configured');
    }

    const messages: any[] = [
      ...history.map(msg => ({ role: msg.role, content: msg.content })),
      {
        role: 'user',
        content: `Kullanıcı mesajı: "${userMessage}"

Hava durumu verisi:
${weatherData}

Bu veriyi kullanarak kullanıcıya dostça ve bilgilendirici bir yanıt ver.`
      }
    ];

    const response = await this.anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      system: this.systemPrompt,
      messages: messages
    });

    return response.content[0].type === 'text' ? response.content[0].text : 'Yanıt oluşturulamadı';
  }

  /**
   * Basit yanıt formatla (AI olmadan)
   */
  private formatSimpleResponse(query: { city: string; type: 'current' | 'forecast' }, weatherData: string): string {
    const greeting = query.type === 'forecast' 
      ? `${query.city} için 7 günlük hava durumu tahmini:` 
      : `${query.city} güncel hava durumu:`;
    
    return `${greeting}\n\n${weatherData}`;
  }

  /**
   * MCP server bağlantısını test et
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.mcpClient.getCurrentWeather('istanbul');
      return true;
    } catch (error) {
      console.error('MCP connection test failed:', error);
      return false;
    }
  }
}
