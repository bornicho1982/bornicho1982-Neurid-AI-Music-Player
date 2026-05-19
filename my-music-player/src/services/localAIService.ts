import { invoke } from '@tauri-apps/api/core';

export const localAIService = {
  isInitialized: false,

  initialize: async () => {
    try {
      const result = await invoke<string>('initialize_ia');
      console.log('IA Initialized:', result);
      localAIService.isInitialized = true;
      return result;
    } catch (error) {
      console.error('Failed to initialize local IA:', error);
      throw error;
    }
  },

  query: async (prompt: string) => {
    if (!localAIService.isInitialized) {
      await localAIService.initialize();
    }
    try {
      const response = await invoke<string>('query_ia', { prompt });
      return { message: response };
    } catch (error) {
      console.error('Local IA Query failed:', error);
      throw error;
    }
  },

  searchWeb: async (query: string) => {
    try {
      const results = await invoke<any[]>('search_web_music', { query });
      return results.map(item => ({
        title: item.title,
        artist: item.artist.name,
        reason: "Encontrado en la red"
      }));
    } catch (error) {
      console.error('Web search failed:', error);
      return [];
    }
  }
};
