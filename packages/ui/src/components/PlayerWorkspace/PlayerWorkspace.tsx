import { FC, ReactNode } from 'react';

import { cn } from '../../utils';
import { PlayerWorkspaceLeftSidebar } from './PlayerWorkspaceLeftSidebar';
import { PlayerWorkspaceRightSidebar } from './PlayerWorkspaceRightSidebar';

type PlayerWorkspaceProps = {
  children: ReactNode;
  className?: string;
};

type MainProps = {
  children?: ReactNode;
  className?: string;
};

const PlayerWorkspaceMain: FC<MainProps> = ({ children, className = '' }) => {
  return (
    <main
      data-testid="player-workspace-main"
      className={cn('bg-background/60 backdrop-blur-2xl overflow-auto my-4 mx-4 rounded-3xl border border-white/5 shadow-2xl flex-1 min-h-0 flex flex-col relative', className)}
    >
      {children}
    </main>
  );
};

type PlayerWorkspaceComponent = FC<PlayerWorkspaceProps> & {
  LeftSidebar: typeof PlayerWorkspaceLeftSidebar;
  RightSidebar: typeof PlayerWorkspaceRightSidebar;
  Main: typeof PlayerWorkspaceMain;
};

const PlayerWorkspaceImpl: FC<PlayerWorkspaceProps> = ({
  children,
  className = '',
}) => {
  return (
    <div
      className={cn(
        'bg-transparent relative flex flex-col h-full min-h-0 w-full',
        className,
      )}
    >
      {children}
    </div>
  );
};

export const PlayerWorkspace = PlayerWorkspaceImpl as PlayerWorkspaceComponent;
PlayerWorkspace.LeftSidebar = PlayerWorkspaceLeftSidebar;
PlayerWorkspace.RightSidebar = PlayerWorkspaceRightSidebar;
PlayerWorkspace.Main = PlayerWorkspaceMain;
