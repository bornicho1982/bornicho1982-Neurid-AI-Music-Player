import { fetch } from '@tauri-apps/plugin-http';

export interface DeezerTrack {
  id: string;
  title: string;
  artist: string;
  albumCover: string;
}

export const deezerConnector = {
  getPlaylistTracks: async (playlistId: string): Promise<DeezerTrack[]> => {
    try {
      // Usamos un proxy de CORS o el API directo si es posible
      const response = await fetch(`https://api.deezer.com/playlist/${playlistId}`);
      if (!response.ok) throw new Error('Deezer playlist fetch failed');
      const data = await response.json();
      
      if (!data.tracks || !data.tracks.data) return [];

      return data.tracks.data.map((t: any) => ({
        id: t.id.toString(),
        title: t.title,
        artist: t.artist.name,
        albumCover: t.album.cover_medium
      }));
    } catch (error) {
      console.error('Deezer API error:', error);
      // Mock data for demo if API fails
      return [
        { id: 'dz1', title: 'Get Lucky', artist: 'Daft Punk', albumCover: '' },
        { id: 'dz2', title: 'Starboy', artist: 'The Weeknd', albumCover: '' }
      ];
    }
  },

  getPlaylistMetadata: async (playlistId: string) => {
    try {
      const response = await fetch(`https://api.deezer.com/playlist/${playlistId}`);
      const data = await response.json();
      return {
        title: data.title,
        coverUrl: data.picture_medium
      };
    } catch (e) {
      return { title: `Deezer Playlist ${playlistId}`, coverUrl: '' };
    }
  }
};
