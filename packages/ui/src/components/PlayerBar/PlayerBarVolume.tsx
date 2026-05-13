import { Volume, Volume1, Volume2, VolumeX } from 'lucide-react';
import { FC } from 'react';

import { Button, Slider } from '..';
import { cn } from '../../utils';

type PlayerBarVolumeProps = {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  disabled?: boolean;
  className?: string;
};

const VolumeIcon: FC<{ value?: number }> = ({ value = 50 }) => {
  if (value === 0) return <VolumeX size={16} />;
  if (value < 33) return <Volume size={16} />;
  if (value < 66) return <Volume1 size={16} />;
  return <Volume2 size={16} />;
};

export const PlayerBarVolume: FC<PlayerBarVolumeProps> = ({
  value,
  defaultValue,
  onValueChange,
  disabled,
  className = '',
}) => {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Button
        size="icon"
        variant="text"
        disabled={disabled}
        onClick={() => onValueChange?.(value === 0 ? 50 : 0)}
        className="transition-all duration-200 hover:scale-110 hover:text-primary"
      >
        <VolumeIcon value={value} />
      </Button>
      <div className="w-24" data-testid="player-volume-slider">
        <Slider
          value={value}
          defaultValue={defaultValue}
          onValueChange={onValueChange}
          disabled={disabled}
          showValue={false}
          showFooter={false}
        />
      </div>
    </div>
  );
};
