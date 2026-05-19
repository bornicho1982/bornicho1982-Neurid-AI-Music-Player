import { getSetting } from '../db';

export interface GeminiResponse {
  message?: string;
  playlist?: {
    title: string;
    tracks: Array<{
      title: string;
      artist: string;
      duration: string;
      vibe: string;
    }>;
  };
  results?: Array<{
    title: string;
    artist: string;
    reason: string;
  }>;
  genres?: string[];
  mood?: string;
  trivia?: string;
  meaning?: string;
  profileName?: string;
  topGenre?: string;
  analysis?: string;
  recommendation?: string;
  categories?: Array<{
    name: string;
    description: string;
    trackIds: number[];
  }>;
  storyTitle?: string;
  chapters?: Array<{
    trackId: number;
    chapterTitle: string;
    narrative: string;
  }>;
  recommendedPlatform?: string;
  match?: string;
  strategy?: string[];
  trendName?: string;
  insight?: string;
  tracks?: Array<{
    title: string;
    artist: string;
    reason: string;
  }>;
  lore?: string;
}

class GeminiService {
  private async getApiKey(): Promise<string> {
    const key = await getSetting('gemini_api_key');
    return key || "";
  }

  async generateContent(prompt: string, systemInstruction: string, isJson: boolean = true): Promise<GeminiResponse> {
    const apiKey = await this.getApiKey();
    if (!apiKey) {
      throw new Error("No se ha configurado la API Key de Gemini en Ajustes.");
    }

    const payload: any = {
      contents: [{ parts: [{ text: prompt }] }],
      systemInstruction: { parts: [{ text: systemInstruction }] },
    };

    if (isJson) {
      payload.generationConfig = { responseMimeType: "application/json" };
    }

    const maxRetries = 3;
    const delays = [1000, 2000, 4000];
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || "API Error");
        }

        const data = await response.json();
        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (textResponse) {
          return isJson ? JSON.parse(textResponse) : { message: textResponse };
        } else {
          throw new Error("Respuesta inválida de la IA");
        }
      } catch (error: any) {
        attempt++;
        if (attempt >= maxRetries) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, delays[attempt - 1]));
      }
    }
    throw new Error("Fallo desconocido tras reintentos");
  }
}

export const geminiService = new GeminiService();
