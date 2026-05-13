import { Music2 } from 'lucide-react';
import { FC, ReactNode } from 'react';

import { cn } from '../../utils';

type PlayerBarNowPlayingProps = {
  title: string;
  artist: string;
  coverUrl?: string;
  isPlaying?: boolean;
  className?: string;
  action?: ReactNode;
  onClick?: () => void;
};

export const PlayerBarNowPlaying: FC<PlayerBarNowPlayingProps> = ({
  title,
  artist,
  coverUrl,
  isPlaying = false,
  className = '',
  action,
  onClick,
}) => (
  <div 
    className={cn('flex min-w-0 items-center gap-3', onClick && 'cursor-pointer group', className)}
    onClick={onClick}
    role={onClick ? 'button' : undefined}
  >
    <div
      className={cn(
        'relative size-14 shrink-0 overflow-hidden rounded-lg shadow-lg transition-all duration-500',
        coverUrl && 'shadow-primary/20',
      )}
    >
      {coverUrl ? (
        <img
          src={coverUrl}
          alt=""
          className={cn(
            'size-full object-cover select-none transition-transform duration-[3s] ease-linear',
            isPlaying && 'scale-105',
          )}
          data-testid="player-now-playing-thumbnail"
        />
      ) : (
        <div
          className="text-foreground-secondary bg-background-secondary flex size-full items-center justify-center"
          data-testid="player-now-playing-placeholder"
        >
          <Music2 size={22} />
        </div>
      )}
      {/* Subtle glow behind cover */}
      {coverUrl && (
        <div className="pointer-events-none absolute -inset-1 -z-10 rounded-lg bg-primary/15 blur-lg" />
      )}
    </div>
    <div className="min-w-0 flex-1">
      <div
        className="text-foreground truncate text-sm font-medium"
        data-testid="now-playing-title"
      >
        {title}
      </div>
      <div
        className="text-foreground-secondary truncate text-xs"
        data-testid="player-now-playing-artist"
      >
        {artist}
      </div>
    </div>
    {action}
  </div>
);
