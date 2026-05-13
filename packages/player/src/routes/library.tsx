import { createFileRoute } from '@tanstack/react-router';

import { LibraryView } from '../views/Library/LibraryView';

export const Route = createFileRoute('/library')({
  component: LibraryView,
});
