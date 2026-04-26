import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import eruda from 'eruda';

eruda.init();

// Create and style a custom floating button
const btn = document.createElement('button');
btn.innerText = 'LOG';
Object.assign(btn.style, {
  position: 'fixed',
  bottom: '20px',
  right: '20px',
  zIndex: '999999',
  padding: '15px 25px',
  backgroundColor: '#f59e0b',
  color: 'white',
  border: 'none',
  borderRadius: '50px',
  fontSize: '18px',
  fontWeight: 'bold',
  boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
});

btn.onclick = () => eruda.show();
document.body.appendChild(btn);

// Hide the original Eruda button
const style = document.createElement('style');
style.innerHTML = '.eruda-entry-btn { display: none !important; }';
document.head.appendChild(style);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
