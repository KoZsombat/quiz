//import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Quiz from './pages/Quiz.tsx'
import Login from './pages/Login.tsx'
import Home from './pages/Home.tsx'
import Create from './pages/Create.tsx'
import Host from './pages/Host.tsx'
import Join from './pages/Join.tsx'
import Admin from './pages/Admin.tsx'
import Broadcast from './pages/Broadcast.tsx'
import './tailwind.css'

createRoot(document.getElementById('root')!).render(
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/create" element={<Create />} />
        <Route path="/host" element={<Host />} />
        <Route path="/quiz/:quizId" element={<Quiz />} />
        <Route path="/join/:quizId" element={<Join />} />
        <Route path="/admin/:quizId" element={<Admin />} />
        <Route path="/broadcast/:quizId" element={<Broadcast />} />
      </Routes>
    </Router>
)
