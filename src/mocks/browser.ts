import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);

// Start the worker when this module is imported
worker.start({
  onUnhandledRequest: 'bypass',
});
