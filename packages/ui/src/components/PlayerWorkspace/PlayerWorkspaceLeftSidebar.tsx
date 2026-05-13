import { FC } from 'react';

import { cn } from '../../utils';
import {
  PlayerWorkspaceSidebar,
  PlayerWorkspaceSidebarPropsBase,
} from './PlayerWorkspaceSidebar';

export const PlayerWorkspaceLeftSidebar: FC<
  PlayerWorkspaceSidebarPropsBase
> = ({ children, ...props }) => {
  return (
    <PlayerWorkspaceSidebar
      side="left"
      className={cn(props.className, 'm-4 rounded-3xl bg-black/40 border border-white/5 shadow-2xl backdrop-blur-3xl overflow-hidden')}
      {...props}
    >
      {children}
    </PlayerWorkspaceSidebar>
  );
};
