import { mediaEngine, TrackResult } from './MediaEngine';
import { useQueueStore } from '../stores/queueStore';

export interface AIIntent {
  type: 'PLAY_MUSIC' | 'SEARCH_MUSIC' | 'CREATE_PLAYLIST' | 'UNKNOWN';
  query?: string;
  artist?: string;
  genre?: string;
}

export interface AIResponse {
  intent: AIIntent;
  message: string;
}

class NeuridAIService {
  private static instance: NeuridAIService;

  static getInstance() {
    if (!NeuridAIService.instance) {
      NeuridAIService.instance = new NeuridAIService();
    }
    return NeuridAIService.instance;
  }

  async detectIntent(query: string): Promise<AIIntent> {
    const q = query.toLowerCase();
    if (q.includes('playlist') || q.includes('lista')) return { type: 'CREATE_PLAYLIST', query };
    if (q.includes('play') || q.includes('reproduce') || q.includes('escuchar')) return { type: 'PLAY_MUSIC', query };
    if (q.includes('buscar') || q.includes('search')) return { type: 'SEARCH_MUSIC', query };
    return { type: 'UNKNOWN' };
  }

  async processQuery(query: string): Promise<string> {
    const intent = await this.detectIntent(query);
    const queueStore = useQueueStore.getState();

    switch (intent.type) {
      case 'PLAY_MUSIC': {
        const results = await mediaEngine.searchAll(intent.query || query);
        if (results.length > 0) {
          queueStore.addToQueue([results[0] as unknown as TrackResult]);
          return `Playing ${results[0].title} by ${results[0].artist}`;
        }
        return "I couldn't find that track.";
      }
      case 'SEARCH_MUSIC':
        return `Searching for ${intent.query || query}...`;
      default:
        return "I'm listening, but I'm not sure how to help with that yet. Try asking me to play some music!";
    }
  }
}

export const neuridAI = NeuridAIService.getInstance();
