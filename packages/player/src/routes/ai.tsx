import { createFileRoute } from '@tanstack/react-router';
import { AIView } from '../views/AI/AIView';

export const Route = createFileRoute('/ai')({
  component: AIView,
});
