import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { DebateScreen } from './components/DebateScreen';
import './styles/tokens.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <DebateScreen />
  </StrictMode>
);
