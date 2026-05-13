import { TrackResult } from '../MediaEngine';

export interface MusicConnector {
  search(query: string): Promise<TrackResult[]>;
  resolve?(id: string): Promise<string | null>;
}

export * from './SpotifyConnector';
export * from './DeezerConnector';
export * from './YouTubeConnector';
