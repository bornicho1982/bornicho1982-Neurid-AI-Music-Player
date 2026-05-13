import { FC, ReactNode } from 'react';

import { cn } from '../utils';

type TopBarProps = {
  children?: ReactNode;
  className?: string;
  draggable?: boolean;
};

export const TopBar: FC<TopBarProps> = ({ children, className = '' }) => {
  return (
    <header
      className={cn(
        'bg-background-secondary/80 border-border grid h-12 grid-cols-[1fr_4fr_1fr] items-center gap-2 border-b-(length:--border-width) px-3 select-none backdrop-blur-xl z-10',
        className,
      )}
      data-tauri-drag-region
    >
      {children}
    </header>
  );
};
