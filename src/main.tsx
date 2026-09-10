import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import * as Sentry from '@sentry/browser';
import App from './App.tsx';
import './index.css';
import { logEvent } from './observability/logger';

// Previously there was no centralized error-tracking tool anywhere
// (P11-observability.md, High) — errors only ever reached console/stdout,
// which disappears on most hosting platforms. Entirely optional: with no
// VITE_SENTRY_DSN set, Sentry.init is skipped and nothing changes.
const sentryDsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment: import.meta.env.MODE,
    tracesSampleRate: 0.1,
  });
}

window.addEventListener("error", (event) => {
  logEvent("error", {
    event: "window_error",
    context: {
      message: event.message,
      source: event.filename,
      line: event.lineno,
      column: event.colno,
    },
  });
  if (sentryDsn) Sentry.captureException(event.error || new Error(event.message));
});

window.addEventListener("unhandledrejection", (event) => {
  logEvent("error", {
    event: "unhandled_rejection",
    context: {
      reason: String(event.reason),
    },
  });
  if (sentryDsn) Sentry.captureException(event.reason);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
