import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import eruda from 'eruda';

eruda.init();

// Create and style a custom floating button
const btn = document.createElement('button');
btn.innerText = 'LOG';
btn.style.setProperty('position', 'fixed');
btn.style.setProperty('bottom', '20px');
btn.style.setProperty('right', '20px');
btn.style.setProperty('zIndex', '999999');
btn.style.setProperty('padding', '15px 25px');
btn.style.setProperty('backgroundColor', '#f59e0b');
btn.style.setProperty('color', 'white');
btn.style.setProperty('border', 'none');
btn.style.setProperty('borderRadius', '50px');
btn.style.setProperty('fontSize', '18px');
btn.style.setProperty('fontWeight', 'bold');
btn.style.setProperty('boxShadow', '0 4px 6px rgba(0,0,0,0.3)');

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
