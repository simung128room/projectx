import React, { StrictMode, Component, ErrorInfo, ReactNode } from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

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

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false
  };

  constructor(props: Props) {
    super(props);
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    fetch('/api/log_error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'react_error', message: error.message, stack: error.stack, componentStack: errorInfo.componentStack })
    }).catch(console.log);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'red', backgroundColor: '#000', minHeight: '100vh' }}>
          <h1>Something went wrong.</h1>
          <pre style={{ color: 'white', whiteSpace: 'pre-wrap' }}>{this.state.error?.message}</pre>
          <pre style={{ color: 'gray', whiteSpace: 'pre-wrap', marginTop: '10px' }}>{this.state.error?.stack}</pre>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
