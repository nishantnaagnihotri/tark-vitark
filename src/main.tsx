import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

function App() {
  return <div id="debate-app">TarkVitark</div>;
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
