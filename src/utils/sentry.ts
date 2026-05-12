/**
 * Sentry Error Tracking — Placeholder
 *
 * To enable Sentry in production:
 * 1. Set your DSN below.
 * 2. Import and call `initSentry()` in main.tsx before rendering.
 *
 * The @sentry/react package is already installed as a dependency.
 */
export const initSentry = () => {
  if (import.meta.env.PROD) {
    import("@sentry/react").then((Sentry) => {
      Sentry.init({
        dsn: "", // Set your Sentry DSN here to enable
        integrations: [
          Sentry.browserTracingIntegration(),
          Sentry.replayIntegration(),
        ],
        tracesSampleRate: 1.0,
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
      });
    });
  }
};
