import { create } from 'zustand';

type UiState = {
  isNowPlayingExpanded: boolean;
};

type UiActions = {
  toggleNowPlaying: () => void;
  setNowPlayingExpanded: (expanded: boolean) => void;
};

export const useUiStore = create<UiState & UiActions>((set) => ({
  isNowPlayingExpanded: false,
  toggleNowPlaying: () =>
    set((state) => ({ isNowPlayingExpanded: !state.isNowPlayingExpanded })),
  setNowPlayingExpanded: (expanded) => set({ isNowPlayingExpanded: expanded }),
}));
