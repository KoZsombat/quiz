import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Quiz from './Quiz.tsx'
import Create from './Create.tsx'
//login rendszer, dashboard, start, eredmeny hirdetes, admin/broadcast felulet
import './tailwind.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Create />
  </StrictMode>,
)
