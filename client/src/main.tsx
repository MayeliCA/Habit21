import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'sonner';
import { SettingsProvider } from '@/hooks/useSettings';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SettingsProvider>
      <App />
      <Toaster position="top-center" richColors closeButton />
    </SettingsProvider>
  </StrictMode>,
);
