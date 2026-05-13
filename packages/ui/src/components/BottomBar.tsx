import { FC, ReactNode } from 'react';

import { cn } from '../utils';

type BottomBarProps = {
  children?: ReactNode;
  className?: string;
};

export const BottomBar: FC<BottomBarProps> = ({ children, className = '' }) => {
  return (
    <footer
      className={cn(
        'bg-background-secondary/80 border-border flex h-16 items-center border-t-(length:--border-width) px-4 backdrop-blur-xl z-10',
        className,
      )}
    >
      {children}
    </footer>
  );
};
