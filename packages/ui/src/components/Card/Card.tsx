import { CassetteTape, Play } from 'lucide-react';
import { FC, ReactNode } from 'react';

import { cn } from '../../utils';
import { Box } from '../Box';
import { Button } from '../Button';
import { ImageReveal } from '../ImageReveal';

type CardProps = {
  src?: string;
  image?: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  onClick?: () => void;
  imageReveal?: boolean;
};

export const Card: FC<CardProps> = ({
  src,
  image,
  title,
  subtitle,
  className,
  onClick,
  imageReveal = true,
}) => (
  <Button
    data-testid="card"
    size="flexible"
    className={cn(
      'group flex w-42 flex-col items-stretch gap-2 p-2 text-left transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-primary/10',
      className,
    )}
    onClick={onClick}
  >
    <Box
      variant="primary"
      shadow="none"
      className="relative aspect-square w-full items-center justify-center overflow-hidden p-0"
    >
      {image ?? (
        <ImageReveal
          enabled={imageReveal}
          src={src}
          alt={title}
          className="absolute inset-0"
          imgClassName="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          placeholder={
            <CassetteTape
              size={96}
              absoluteStrokeWidth
              className="opacity-20"
            />
          }
        />
      )}
      {/* Play overlay on hover */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/30 group-hover:opacity-100">
        <div className="flex size-10 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/30 transition-transform duration-300 scale-75 group-hover:scale-100">
          <Play size={18} className="ml-0.5 text-white" />
        </div>
      </div>
    </Box>

    {(title || subtitle) && (
      <div className="min-w-0">
        {title && (
          <div
            data-testid="card-title"
            className="text-foreground truncate text-sm font-medium group-hover:text-primary transition-colors duration-200"
          >
            {title}
          </div>
        )}
        {subtitle && (
          <div className="text-foreground truncate text-xs opacity-50">
            {subtitle}
          </div>
        )}
      </div>
    )}
  </Button>
);
