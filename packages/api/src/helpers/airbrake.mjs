import { Notifier } from '@airbrake/node';

const airbrake = new Notifier({
  projectId: process.env.AIRBRAKE_PROJECT_ID,
  projectKey: process.env.AIRBRAKE_PROJECT_KEY,
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
