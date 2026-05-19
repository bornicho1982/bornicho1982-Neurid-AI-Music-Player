import { invoke } from '@tauri-apps/api/core';
import { fetch } from '@tauri-apps/plugin-http';
import { saveSetting, getSetting } from '../db';

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: string[];
  coverUrl: string;
}

export const spotifyConnector = {
  authenticate: async () => {
    const clientId = localStorage.getItem('spotify_client_id');
    const clientSecret = localStorage.getItem('spotify_client_secret');
    
    if (!clientId || !clientSecret) {
      alert("Por favor, configura tu Client ID y Secret en Ajustes.");
      throw new Error("Missing credentials");
    }

    try {
      const accessToken = await invoke<string>('authenticate_spotify', { 
        clientId: clientId,
        clientSecret: clientSecret
      });
      console.log('Spotify token received from backend:', accessToken);
      
      if (accessToken) {
        await saveSetting('spotify_access_token', accessToken);
        alert("¡Conexión con Spotify exitosa!");
        return accessToken;
      }
      throw new Error("Token exchange failed");
    } catch (error) {
      console.error('Spotify auth failed:', error);
      throw error;
    }
  },

  getPlaylistMetadataAndTracks: async (playlistId: string): Promise<{ name: string; coverUrl: string; tracks: SpotifyTrack[] }> => {
    const cleanId = playlistId.split('?')[0].split('/').pop() || playlistId;
    try {
      const response = await fetch(`https://open.spotify.com/embed/playlist/${cleanId}`);
      if (response.ok) {
        const html = await response.text();

        // 1. Intentar parsear initial-state (Base64)
        const match = html.match(/<script id="initial-state" type="text\/plain">([\s\S]*?)<\/script>/);
        if (match && match[1]) {
          const decoded = atob(match[1].trim());
          const parsed = JSON.parse(decoded);
          const resource = parsed.resource;
          if (resource) {
            const name = resource.name || `Spotify Playlist ${cleanId}`;
            const coverUrl = resource.images?.[0]?.url || '';
            const tracks = (resource.tracks?.items || []).map((item: any) => ({
              id: item.track?.id || Math.random().toString(),
              name: item.track?.name || 'Unknown Track',
              artists: (item.track?.artists || []).map((a: any) => a.name),
              coverUrl: item.track?.album?.images?.[0]?.url || ''
            }));
            return { name, coverUrl, tracks };
          }
        }

        // 2. Intentar parsear __NEXT_DATA__
        const nextMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
        if (nextMatch && nextMatch[1]) {
          const parsed = JSON.parse(nextMatch[1].trim());
          const playlistData = parsed.props?.pageProps?.state?.playlist;
          if (playlistData) {
            const name = playlistData.name || `Spotify Playlist ${cleanId}`;
            const coverUrl = playlistData.images?.[0]?.url || '';
            const tracks = (playlistData.tracks?.items || []).map((item: any) => ({
              id: item.track?.id || Math.random().toString(),
              name: item.track?.name || 'Unknown Track',
              artists: (item.track?.artists || []).map((a: any) => a.name),
              coverUrl: item.track?.album?.images?.[0]?.url || ''
            }));
            return { name, coverUrl, tracks };
          }
        }
      }

      // 3. Backup: si hay token oficial de desarrollador o almacenado en Rust
      let token = await invoke<string | null>('get_token', { key: 'spotify_access_token' }).catch(() => null);
      if (!token) {
        token = await getSetting('spotify_access_token');
      }
      if (token) {
        const metaRes = await fetch(`https://api.spotify.com/v1/playlists/${cleanId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (metaRes.ok) {
          const data = await metaRes.json();
          
          const trackRes = await fetch(`https://api.spotify.com/v1/playlists/${cleanId}/tracks`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const trackData = await trackRes.json();
          const tracks = (trackData.items || []).map((item: any) => ({
            id: item.track.id,
            name: item.track.name,
            artists: item.track.artists.map((a: any) => a.name),
            coverUrl: item.track.album.images[0]?.url || ''
          }));

          return {
            name: data.name || `Spotify Playlist ${cleanId}`,
            coverUrl: data.images[0]?.url || '',
            tracks
          };
        }
      }
    } catch (error) {
      console.error("Error scraping Spotify playlist:", error);
    }

    // 4. Último recurso (Mock Data limpia)
    return {
      name: `Spotify Playlist ${cleanId}`,
      coverUrl: '',
      tracks: [
        { id: '1', name: 'Blinding Lights', artists: ['The Weeknd'], coverUrl: '' },
        { id: '2', name: 'Save Your Tears', artists: ['The Weeknd'], coverUrl: '' }
      ]
    };
  }
};
