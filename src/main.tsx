import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { CalculatorApp } from './components/CalculatorApp';
import './styles/reset.css';
import './styles/tokens.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <CalculatorApp />
  </StrictMode>
);
