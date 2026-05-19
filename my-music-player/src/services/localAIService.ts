import { invoke } from '@tauri-apps/api/core';
import { usePlayerStore } from '../store/playerStore';

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
      const library = usePlayerStore.getState().library || [];
      const libraryText = library.map(t => {
        const title = t.title || t.filename || 'Desconocido';
        const artist = t.artist || 'Desconocido';
        const album = t.album || 'Desconocido';
        const duration = t.duration || 0;
        return `- "${title}" por ${artist} (${album}) [${Math.floor(duration/60)}:${Math.floor(duration%60).toString().padStart(2,'0')}]`;
      }).join('\n');

      const systemPrompt = `[SYSTEM] Rol: Especialista en curación musical y análisis técnico de Neurid Music Player. Tu objetivo es ayudar al usuario a seleccionar, organizar y descubrir música.

Biblioteca local:
${libraryText}

[USER] ${prompt}
[ASSISTANT]`;

      const response = await invoke<string>('query_ia', { prompt: systemPrompt });
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
