import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { DocsApp } from './DocsApp';
// Same global CSS as the product, so every example renders exactly as it ships.
import '@/styles/tokens.css';
import '@/styles/global.css';
import '@/styles/transitions.css';
// Docs chrome tokens, built only from the product tokens above.
import './docs-tokens.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DocsApp />
  </StrictMode>,
);
