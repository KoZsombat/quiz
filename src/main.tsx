import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Quiz from './Quiz.tsx'
import Login from './login.tsx'
import Home from './home.tsx'
import Create from './Create.tsx'
import Host from './host.tsx'
//dashboard, eredmeny hirdetes, admin/broadcast felulet, csak akkor lehessen csatlakozni ha el van indítva
import './tailwind.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/create" element={<Create />} />
        <Route path="/host" element={<Host />} />
        <Route path="/quiz/:quizId" element={<Quiz />} />
      </Routes>
    </Router>
  </StrictMode>,
)
