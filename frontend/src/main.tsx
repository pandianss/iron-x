import { StrictMode } from 'react'
// alert('Main.tsx Executing'); // Debug confirmation
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'


try {
  // alert('Main.tsx Executing'); // Debug confirmation
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
} catch (e: unknown) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const errorMessage = (e as any)?.message || String(e);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const errorStack = (e as any)?.stack || '';

  document.body.innerHTML = `<div style="color:red; padding: 20px; font-family: monospace;">
    <h1>Startup Error</h1>
    <pre>${errorMessage}</pre>
    <pre>${errorStack}</pre>
  </div>`
}
