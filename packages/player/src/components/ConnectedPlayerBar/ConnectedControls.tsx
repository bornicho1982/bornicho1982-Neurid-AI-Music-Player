import {
  PauseIcon,
  PlayIcon,
  SkipBackIcon,
  SkipForwardIcon,
} from 'lucide-react';
import { FC } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { useQueueStore } from '../../stores/queueStore';
import { useSoundStore } from '../../stores/soundStore';

export const ConnectedControls: FC = () => {
  const { goToNext, goToPrevious } = useQueueStore(
    useShallow((state) => ({
      goToNext: state.goToNext,
      goToPrevious: state.goToPrevious,
    })),
  );
  const { status, toggle } = useSoundStore(
    useShallow((state) => ({
      status: state.status,
      toggle: state.toggle,
    })),
  );

  return (
    <div className="flex items-center gap-12">
      <button 
        onClick={goToPrevious}
        className="text-white/40 hover:text-white transition-all active:scale-90"
      >
        <SkipBackIcon size={28} fill="currentColor" />
      </button>

      <button 
        onClick={toggle}
        className="play-button-main"
      >
        {status === 'playing' ? (
          <PauseIcon size={32} fill="currentColor" />
        ) : (
          <PlayIcon size={32} fill="currentColor" className="ml-1" />
        )}
      </button>

      <button 
        onClick={goToNext}
        className="text-white/40 hover:text-white transition-all active:scale-90"
      >
        <SkipForwardIcon size={28} fill="currentColor" />
      </button>
    </div>
  );
};
