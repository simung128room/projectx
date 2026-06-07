import React, { StrictMode } from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary';

import Swal from 'sweetalert2';
const originalFire = Swal.fire;
(Swal as any).fire = function(...args: any[]) {
  let opts = args[0] || {};
  if (typeof args[0] === 'string') {
    opts = { title: args[0], text: args[1], icon: args[2] };
  } else {
    opts = { ...args[0] };
  }
  
  if (!opts.showCancelButton && !opts.input && !opts.confirmButtonText && opts.showConfirmButton !== true) {
    opts.toast = true;
    opts.position = 'top-end';
    opts.showConfirmButton = false;
    opts.timer = opts.timer || 3000;
    opts.timerProgressBar = true;
    opts.customClass = {
      popup: 'brutalist-toast',
    };
  }
  return originalFire.call(Swal, opts);
};


if (import.meta.env.MODE !== 'production') {
  import('eruda').then((eruda) => eruda.default.init()).catch(() => {});
}

// Remote error logging
window.onerror = function (message, source, lineno, colno, error) {
  fetch('/api/log_error', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'onerror', message, source, lineno, colno, stack: error?.stack })
  }).catch(console.log);
};

window.addEventListener('unhandledrejection', function(event) {
  if (!event.reason) {
    return;
  }
  // Prevent logging empty rejection reasons
  if (typeof event.reason === 'object' && Object.keys(event.reason).length === 0 && event.reason.constructor === Object) {
    return;
  }
  
  if (event.reason && typeof event.reason.message === 'string' && (event.reason.message.includes('WebSocket') || event.reason.message.includes('Lock was stolen'))) {
    event.preventDefault();
    return;
  }

  if (typeof event.reason === 'string' && (event.reason.includes('WebSocket') || event.reason.includes('Lock was stolen'))) {
    event.preventDefault();
    return;
  }
  
  // Attempt to stringify the reason safely or extract its message
  let reasonDetails: any = event.reason;
  if (event.reason instanceof Error) {
    reasonDetails = event.reason.message + '\n' + event.reason.stack;
  } else if (event.reason.isAxiosError && event.reason.message) {
    reasonDetails = event.reason.message;
  } else if (typeof event.reason === 'object') {
    try {
      // Just extract message if available to avoid circular JSON
      if (event.reason.message) {
        reasonDetails = event.reason.message;
      } else {
        const cache = new Set();
        reasonDetails = JSON.stringify(event.reason, (key, value) => {
          if (typeof value === 'object' && value !== null) {
            if (cache.has(value)) {
              return '[Circular]';
            }
            cache.add(value);
          }
          return value;
        });
      }
    } catch(e) {
      reasonDetails = String(event.reason);
    }
  }

  if (!reasonDetails || reasonDetails === '{}') {
    return;
  }

  console.error('[Unhandled Rejection] Reason:', reasonDetails);
  
  let payload: any = { type: 'unhandledrejection' };
  
  try {
    payload.reason = typeof reasonDetails === 'string' ? reasonDetails : String(reasonDetails);
  } catch (e) {
    payload.reason = 'Could not stringify reason (possibly circular)';
  }

  fetch('/api/log_error', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).catch(console.log);
});



import { onCLS, onINP, onLCP, onFCP, onTTFB } from 'web-vitals';

function sendToAnalytics(metric: any) {
  const body = JSON.stringify({ metric });
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/log_vitals', body);
  } else {
    fetch('/api/log_vitals', { body, method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' } }).catch(console.log);
  }
}

onCLS(sendToAnalytics);
onINP(sendToAnalytics);
onLCP(sendToAnalytics);
onFCP(sendToAnalytics);
onTTFB(sendToAnalytics);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
