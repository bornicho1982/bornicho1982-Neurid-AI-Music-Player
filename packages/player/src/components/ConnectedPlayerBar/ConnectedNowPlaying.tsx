import { MusicIcon } from 'lucide-react';
import { FC } from 'react';

import { useTranslation } from '@nuclearplayer/i18n';
import { pickArtwork } from '@nuclearplayer/model';
import { FavoriteButton } from '@nuclearplayer/ui';

import { useFavoritesStore } from '../../stores/favoritesStore';
import { useQueueStore } from '../../stores/queueStore';
import { useSoundStore } from '../../stores/soundStore';
import { useUiStore } from '../../stores/uiStore';

export const ConnectedNowPlaying: FC = () => {
  const { t } = useTranslation('playerBar');
  const { t: tTrack } = useTranslation('track');
  const currentItem = useQueueStore((s) => s.getCurrentItem());
  const isPlaying = useSoundStore((s) => s.status === 'playing');
  const toggleNowPlaying = useUiStore((s) => s.toggleNowPlaying);
  const { isTrackFavorite, addTrack, removeTrack } = useFavoritesStore();

  const track = currentItem?.track;
  const isFavorite = track ? isTrackFavorite(track.source) : false;

  const artwork = pickArtwork(track?.artwork, 'thumbnail', 64);
  const title = track?.title ?? t('noTrackPlaying');
  const artist = track?.artists[0]?.name ?? '';

  const handleToggleFavorite = () => {
    if (!track) {
      return;
    }
    if (isFavorite) {
      removeTrack(track.source);
    } else {
      addTrack(track);
    }
  };

  return (
    <div 
      onClick={toggleNowPlaying}
      className="flex items-center gap-4 cursor-pointer group min-w-0"
    >
      <div className="relative flex-shrink-0">
        {artwork ? (
          <img
            src={artwork.url}
            alt={title}
            className="w-14 h-14 rounded-xl object-cover shadow-2xl group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-white/10 transition-all">
            <MusicIcon size={24} className="text-white/20" />
          </div>
        )}
        {isPlaying && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary rounded-full neon-glow border-2 border-[#0a0a0f] animate-pulse" />
        )}
      </div>

      <div className="flex flex-col min-w-0">
        <h4 className="text-base font-black text-white truncate leading-tight group-hover:text-primary transition-colors">
          {title}
        </h4>
        <p className="text-xs font-bold text-white/40 truncate tracking-wide">
          {artist.toUpperCase()}
        </p>
      </div>

      {track && (
        <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <FavoriteButton
            size="sm"
            isFavorite={isFavorite}
            onToggle={handleToggleFavorite}
            ariaLabelAdd={tTrack('actions.addToFavorites')}
            ariaLabelRemove={tTrack('actions.removeFromFavorites')}
          />
        </div>
      )}
    </div>
  );
};
