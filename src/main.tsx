import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Quiz from './Quiz.tsx'
import Login from './login.tsx'
import Home from './home.tsx'
import Create from './Create.tsx'
import Host from './host.tsx'
import Join from './Join.tsx'
import Admin from './Admin.tsx'
//dashboard, admin/broadcast felulet, quizId a host altal krealt kod legyen
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
        <Route path="/join/:quizId" element={<Join />} />
        <Route path="/admin/:quizId" element={<Admin />} />
      </Routes>
    </Router>
  </StrictMode>,
)
