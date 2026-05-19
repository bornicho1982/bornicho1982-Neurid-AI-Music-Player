import { pipedResolver, PipedTrack } from './pipedResolver';

export const ytMusicConnector = {
  searchTracks: async (query: string): Promise<PipedTrack[]> => {
    return await pipedResolver.search(query);
  },

  getAlbumTracks: async (_albumId: string): Promise<PipedTrack[]> => {
    // Piped supports fetching album details
    try {
      // Logic would be similar to search but using the album endpoint
      // For now we reuse search or implement a simplified version
      return [];
    } catch (error) {
      console.error('YT Music Album error:', error);
      return [];
    }
  }
};
