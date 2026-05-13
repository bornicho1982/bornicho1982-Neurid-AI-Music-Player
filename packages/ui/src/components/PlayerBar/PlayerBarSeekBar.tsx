import { FC } from 'react';

import '../../styles.css';

import { cn } from '../../utils';
import { formatTimeSeconds } from '../../utils/time';
import { useSeekBar } from './useSeekBar';

export type PlayerSeekBarProps = {
  progress: number;
  elapsedSeconds: number;
  remainingSeconds: number;
  isLoading?: boolean;
  onSeek?: (percent: number) => void;
  className?: string;
};

export const PlayerBarSeekBar: FC<PlayerSeekBarProps> = ({
  progress,
  elapsedSeconds,
  remainingSeconds,
  isLoading = false,
  onSeek,
  className = '',
}) => {
  const { clamped, containerRef, handleClick, isInteractive } = useSeekBar({
    progress,
    isLoading,
    onSeek,
  });

  return (
    <div className={cn('w-full select-none', className)}>
      <div
        ref={containerRef}
        className={cn('group relative h-4 w-full', {
          'pointer-events-none cursor-not-allowed': isLoading,
          'cursor-pointer': isInteractive,
        })}
        onClick={handleClick}
        aria-disabled={isLoading}
      >
        <div className="absolute right-0 left-0 z-10 flex h-full flex-row items-center justify-between px-2 pt-0.5 text-xs leading-none">
          <span className="text-foreground/70 tabular-nums text-[11px] font-medium">
            {formatTimeSeconds(elapsedSeconds)}
          </span>
          <span className="text-foreground/40 tabular-nums text-[11px]">
            {formatTimeSeconds(-Math.abs(remainingSeconds))}
          </span>
        </div>
        <div
          className={cn(
            'bg-background-secondary/60 absolute inset-0 backdrop-blur-sm border-t border-white/[0.04]',
            {
              'overflow-hidden': isLoading,
            },
          )}
        >
          {isLoading && (
            <div className="bg-stripes-diagonal absolute inset-0 opacity-80" />
          )}
          {!isLoading && (
            <>
              <div
                className="bg-gradient-to-r from-primary/80 to-primary h-full transition-none relative"
                style={{ width: `${clamped}%` }}
              >
                {/* Glowing progress dot */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 size-2 rounded-full bg-primary shadow-[0_0_8px_var(--glow-color-strong)] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
