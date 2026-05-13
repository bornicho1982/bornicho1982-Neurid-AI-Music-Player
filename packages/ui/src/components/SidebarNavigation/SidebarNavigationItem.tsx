import { Link } from '@tanstack/react-router';
import { FC, ReactNode } from 'react';

import { cn } from '../../utils';
import { Tooltip } from '../Tooltip/Tooltip';
import { useSidebarCompact } from './SidebarCompactContext';

type SidebarNavigationItemProps = {
  icon: ReactNode;
  label: string;
  isSelected?: boolean;
  to?: string;
  onClick?: () => void;
};

const MaybeNavLink: FC<{
  to?: string;
  isSelected?: boolean;
  children: (isSelected: boolean) => ReactNode;
}> = ({ to, isSelected = false, children }) => {
  if (to) {
    return <Link to={to}>{({ isActive }) => children(isActive)}</Link>;
  }
  return <>{children(isSelected)}</>;
};

export const SidebarNavigationItem: FC<SidebarNavigationItemProps> = ({
  icon,
  label,
  isSelected,
  to,
  onClick,
}) => {
  const isCompact = useSidebarCompact();

  return (
    <MaybeNavLink to={to} isSelected={isSelected}>
      {(active) => (
        <Tooltip content={label} side="right" disabled={!isCompact}>
          <div
            role={onClick ? 'button' : undefined}
            onClick={onClick}
            data-testid="sidebar-navigation-item"
            className={cn(
              'group relative flex w-full items-center overflow-hidden rounded-md border-(length:--border-width) transition-all duration-200',
              {
                'cursor-pointer': onClick,
                'bg-primary/15 border-primary/30 text-primary font-medium shadow-[inset_0_1px_0_oklch(1_0_0/0.1)] glow-accent': active,
                'hover:bg-white/5 border-transparent text-foreground-secondary hover:text-foreground': !active,
              },
            )}
          >
            <div className="flex size-8 shrink-0 items-center justify-center">
              {icon}
            </div>
            <span
              className={cn(
                'text-sm whitespace-nowrap transition-opacity duration-150',
                {
                  'opacity-0': isCompact,
                  'opacity-100': !isCompact,
                },
              )}
            >
              {label}
            </span>
          </div>
        </Tooltip>
      )}
    </MaybeNavLink>
  );
};
