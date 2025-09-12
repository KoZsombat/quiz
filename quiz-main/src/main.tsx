import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Quiz from './Quiz.tsx'
import Create from './Create.tsx'

import './tailwind.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Create />
  </StrictMode>,
)
