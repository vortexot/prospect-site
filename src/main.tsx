import './core/earlyUniverse'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/archivo/standard.css'
import './styles/base.css'
import './styles/sections.css'
import App from './App'

createRoot(document.getElementById('root')!).render(<App />)
