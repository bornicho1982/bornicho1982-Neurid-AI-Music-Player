import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ServiceAuth {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  userId: string | null;
  userName: string | null;
}

interface AuthState {
  spotify: ServiceAuth;
  deezer: ServiceAuth;
  
  setSpotifyAuth: (auth: Partial<ServiceAuth>) => void;
  setDeezerAuth: (auth: Partial<ServiceAuth>) => void;
  logout: (service: 'spotify' | 'deezer') => void;
}

const initialServiceAuth: ServiceAuth = {
  accessToken: null,
  refreshToken: null,
  expiresAt: null,
  userId: null,
  userName: null,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      spotify: { ...initialServiceAuth },
      deezer: { ...initialServiceAuth },
      
      setSpotifyAuth: (auth) => set((state) => ({ 
        spotify: { ...state.spotify, ...auth } 
      })),
      
      setDeezerAuth: (auth) => set((state) => ({ 
        deezer: { ...state.deezer, ...auth } 
      })),
      
      logout: (service) => set((state) => ({ 
        [service]: { ...initialServiceAuth } 
      })),
    }),
    {
      name: 'neurid-auth-store',
    }
  )
);
