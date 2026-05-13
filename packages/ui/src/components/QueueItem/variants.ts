import { cva } from 'class-variance-authority';

export const queueItemVariants = cva(
  'group relative flex items-center gap-2 overflow-hidden ring-offset-white transition-all',
  {
    variants: {
      status: {
        idle: '',
        loading: 'opacity-70',
        error: '',
        success: '',
      },
      isCurrent: {
        true: 'bg-primary/10 border-l-2 border-l-primary shadow-[inset_0_0_20px_var(--glow-color)]',
        false: 'hover:bg-white/[0.03]',
      },
      isCollapsed: {
        true: 'h-9 w-9 justify-center p-0',
        false: 'w-full p-0',
      },
    },
    defaultVariants: {
      status: 'idle',
      isCurrent: false,
      isCollapsed: false,
    },
  },
);
