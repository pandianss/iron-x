import { StrictMode } from 'react'
// alert('Main.tsx Executing'); // Debug confirmation
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'


try {
  // alert('Main.tsx Executing'); // Debug confirmation
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
} catch (e: any) {
  document.body.innerHTML = `<div style="color:red; padding: 20px; font-family: monospace;">
    <h1>Startup Error</h1>
    <pre>${e?.message || e}</pre>
    <pre>${e?.stack || ''}</pre>
  </div>`
}
