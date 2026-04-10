import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Schedule from './pages/Schedule'
import Achievements from './pages/Achievements'
import Quiz from './pages/Quiz'
import AIAssistant from './components/AIAssistant'

function App() {
  const [subjects, setSubjects] = useState([])
  const [refreshKey, setRefreshKey] = useState(0)

  const refreshSubjects = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <Router>
      <div className="app">
        <Navbar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard key={refreshKey} />} />
            <Route path="/schedule" element={<Schedule subjects={subjects} />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/quiz" element={<Quiz />} />
          </Routes>
        </div>
        <AIAssistant onSubjectCreated={refreshSubjects} />
      </div>
    </Router>
  )
}

export default App

