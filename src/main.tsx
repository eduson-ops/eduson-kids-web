import './lib/native-boot'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initAudioUnlock } from './lib/audioUnlock'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Register the global audio-unlock listeners after React mounts.
// Mobile WebViews suspend AudioContext until a user gesture — this resumes it
// on the first tap/click/keydown anywhere in the document.
initAudioUnlock()
