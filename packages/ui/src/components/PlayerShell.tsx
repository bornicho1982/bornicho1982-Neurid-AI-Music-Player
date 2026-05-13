import { FC, ReactNode } from 'react';

import { cn } from '../utils';

type PlayerShellProps = {
  children: ReactNode;
  className?: string;
};

export const PlayerShell: FC<PlayerShellProps> = ({
  children,
  className = '',
}) => {
  return (
    <div
      className={cn(
        'bg-black relative grid h-screen w-screen grid-rows-[auto_1fr_auto] overflow-hidden',
        className,
      )}
    >
      {/* Neurid Deep Mesh Background */}
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -left-[20%] -top-[10%] h-[60%] w-[60%] rounded-full bg-blue-900 blur-[150px]" />
        <div className="absolute right-[0%] top-[40%] h-[50%] w-[50%] rounded-full bg-purple-900 blur-[150px]" />
        <div className="absolute left-[20%] bottom-[-20%] h-[50%] w-[50%] rounded-full bg-emerald-900 blur-[150px]" />
      </div>
      
      <div className="z-10 contents">{children}</div>
    </div>
  );
};
