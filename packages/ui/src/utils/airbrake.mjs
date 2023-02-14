import { Notifier } from '@airbrake/browser';

const airbrake = new Notifier({
  projectId: import.meta.env.VITE_AIRBRAKE_PROJECT_ID,
  projectKey: import.meta.env.VITE_AIRBRAKE_PROJECT_KEY,
  environment: process.env.NODE_ENV,
});

airbrake.addFilter(notice => {
  if (notice.context.environment !== 'production') {
    // Ignore errors not from production.
    return null;
  }
  return notice;
});

export default airbrake;
