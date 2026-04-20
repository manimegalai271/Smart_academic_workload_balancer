import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import StudyTimer from './StudyTimer'

function StudySchedule({ subjectId }) {
  const [subject, setSubject] = useState(null)
  const [velocityData, setVelocityData] = useState(null)
  const [panicMode, setPanicMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const [timerOpen, setTimerOpen] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState(null)
  const [selectedTopicIndex, setSelectedTopicIndex] = useState(null)
  const [activeTimerTopic, setActiveTimerTopic] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (subjectId) {
      fetchSubject()
    }
  }, [subjectId])

  const fetchSubject = async () => {
    try {
      const subjectRes = await fetch(`/api/subjects/${subjectId}`)
      const subjectData = await subjectRes.json()
      setSubject(subjectData)

      // Fetch velocity data
      const velocityRes = await fetch(`/api/progress/velocity/${subjectId}`)
      if (velocityRes.ok) {
        const velData = await velocityRes.json()
        setVelocityData(velData)
      }
    } catch (error) {
      console.error('Error fetching subject/velocity:', error)
    }
    setLoading(false)
  }

  const handleTopicToggle = async (topicIndex) => {
    try {
      await fetch('/api/subjects/topic-complete', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectId, topicIndex })
      })
      fetchSubject()
    } catch (error) {
      console.error('Error updating topic:', error)
    }
  }

  const handleTopicClick = (topic, index) => {
    // Don't allow clicking on completed topics for starting timer
    if (!topic.completed) {
      setSelectedTopic(topic.name)
      setSelectedTopicIndex(index)
      setTimerOpen(true)
    }
  }

  const handleTimerClose = () => {
    setTimerOpen(false)
    setSelectedTopic(null)
    setSelectedTopicIndex(null)
  }

  const togglePanicMode = async () => {
    try {
      const res = await fetch(`/api/subjects/${subjectId}/prune`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ panic: !panicMode })
      })
      const data = await res.json()
      if (data.success) {
        setPanicMode(!panicMode)
        fetchSubject() // Refresh
        console.log(data.message)
      }
    } catch (error) {
      console.error('Error toggling panic mode:', error)
    }
  }

  const visibleTopics = subject?.topics?.filter(t => !t.hidden) || []

  const handleSessionComplete = () => {
    // Refresh the subject data to update progress
    fetchSubject()
  }

  const handleStartQuiz = () => {
    // Navigate to quiz page with subject data (visible topics only)
    navigate('/quiz', {
      state: {
        subjectName: subject.name,
        topics: visibleTopics,
        difficulty: 'medium',
        subjectId: subject._id
      }
    })
  }

  if (loading) return <div>Loading...</div>
  if (!subject) return <div>Subject not found</div>

  // Check if all topics are completed
  const allTopicsCompleted = subject.completedTopics >= subject.totalTopics && subject.totalTopics > 0

  // Group topics by day
  const topicsByDay = subject.topics?.reduce((acc, topic) => {
    const day = topic.dayNumber || 1
    if (!acc[day]) acc[day] = []
    acc[day].push(topic)
    return acc
  }, {})

  return (
    <div className="schedule-container">
      <h2>📅 {subject.name} - Study Schedule</h2>
      <div className="progress-bar" style={{ marginBottom: '20px' }}>
        <div 
          className="progress-fill" 
          style={{ width: `${subject.progress || 0}%` }}
        ></div>
      </div>
      <p style={{ marginBottom: '10px' }}>
        Progress: {subject.completedTopics || 0} of {subject.totalTopics || 0} topics completed
      </p>
      
      {/* Velocity Predictor */}
      {velocityData && (
        <div className={`velocity-card mb-4 p-3 rounded-lg ${
          velocityData.riskLevel === 'high' ? 'bg-red-50 border-red-200' :
          velocityData.riskLevel === 'medium' ? 'bg-yellow-50 border-yellow-200' :
          velocityData.riskLevel === 'low' ? 'bg-green-50 border-green-200' :
          'bg-blue-50 border-blue-200'
        } border-2`}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold">🚀 Velocity: {velocityData.velocity}x</span>
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
              velocityData.velocity > 1.2 ? 'bg-green-100 text-green-800' :
              velocityData.velocity < 0.8 ? 'bg-red-100 text-red-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {velocityData.velocity > 1.2 ? 'Fast ⚡' : velocityData.velocity < 0.8 ? 'Slow 🐌' : 'On Track ✅'}
            </span>
          </div>
          <div className="text-sm">
            📅 Projected: <strong>{velocityData.projectedDate}</strong> 
            ({velocityData.daysNeeded.toFixed(1)} days)
          </div>
          {velocityData.riskMessage && (
            <div className={`mt-2 p-2 rounded text-sm ${
              velocityData.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
              velocityData.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
              'bg-green-100 text-green-800'
            }`}>
              {velocityData.riskMessage}
            </div>
          )}
        </div>
      )}
      
      <p className="timer-hint" style={{ marginBottom: '20px', color: '#666', fontSize: '0.9rem' }}>
        💡 Click on a topic to start a study timer
      </p>

      {/* Panic Mode Toggle */}
      <div className="panic-toggle mb-4" style={{ textAlign: 'center' }}>
        <button 
          className={`btn ${panicMode ? 'btn-success' : 'btn-warning'}`}
          onClick={togglePanicMode}
          style={{ 
            padding: '8px 20px', 
            fontSize: '0.95rem',
            borderRadius: '20px'
          }}
        >
          {panicMode ? '✅ Panic Mode ON (Focus Mode)' : '⚠️ Activate Panic Mode'}
        </button>
        {panicMode && (
          <p style={{ marginTop: '8px', color: '#d32f2f', fontSize: '0.85rem' }}>
            🛡️ Showing only core topics - 30% trimmed for deadline pressure!
          </p>
        )}
        <p style={{ marginTop: '4px', color: '#666', fontSize: '0.8rem' }}>
          Visible: {visibleTopics.length} / {subject?.topics?.length || 0} topics
        </p>
      </div>

      {/* Quiz Button - Show when all VISIBLE topics are completed */}
      {visibleTopics.length > 0 && visibleTopics.every(t => t.completed) && (
        <div className="card" style={{ 
          marginBottom: '20px', 
          backgroundColor: '#e8f5e9', 
          border: '2px solid #4caf50',
          textAlign: 'center',
          padding: '20px'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#2e7d32' }}>
            🎉 Congratulations! You've completed all {panicMode ? 'core' : 'planned'} topics!
          </h3>
          <p style={{ marginBottom: '15px', color: '#555' }}>
            Test your knowledge with an AI-generated quiz!
          </p>
          <button 
            onClick={handleStartQuiz}
            className="btn btn-primary"
            style={{ 
              fontSize: '1.1rem',
              padding: '12px 30px',
              backgroundColor: '#4caf50',
              borderColor: '#4caf50'
            }}
          >
            🎯 Take AI Quiz
          </button>
        </div>
      )}

      {Object.entries(topicsByDay || {})
        .map(([day, dayTopics]) => {
          const visibleDayTopics = dayTopics.filter(t => !t.hidden)
          if (visibleDayTopics.length === 0) return null
          return (
            <div key={day} className="schedule-day">
              <h3>Day {day} ({visibleDayTopics.length}/{dayTopics.length})</h3>
              <span className={`difficulty ${visibleDayTopics[0]?.difficulty || 'medium'}`}>
                {visibleDayTopics[0]?.difficulty || 'medium'}
              </span>
              <ul className="schedule-topics">
                {visibleDayTopics.map((topic, index) => {
                  const globalIndex = subject.topics.findIndex(t => t._id === topic._id || t === topic)
                  const isTimerActive = activeTimerTopic === globalIndex
                  return (
                    <li 
                      key={topic._id || index} 
                      className={`topic-item ${topic.completed ? 'completed' : ''} ${isTimerActive ? 'timer-active' : ''} ${topic.priority === 'core' ? 'core-topic' : ''}`}
                    >
                      <span className={`priority-badge ${topic.priority}`} style={{ marginRight: '8px' }}>
                        {topic.priority === 'core' ? '⭐' : '📖'}
                      </span>
                      <input
                        type="checkbox"
                        className="checkbox"
                        checked={topic.completed || false}
                        onChange={(e) => {
                          e.stopPropagation()
                          handleTopicToggle(globalIndex)
                        }}
                        disabled={isTimerActive}
                      />
                      <span style={{ 
                        textDecoration: topic.completed ? 'line-through' : 'none',
                        opacity: topic.completed ? 0.6 : 1,
                        flex: 1,
                        cursor: topic.completed ? 'default' : 'pointer'
                      }}>
                        {topic.name}
                      </span>
                      {!topic.completed && (
                        <span 
                          className="topic-timer-icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleTopicClick(topic, globalIndex)
                          }}
                          style={{ cursor: 'pointer' }}
                        >⏱️</span>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })
        .filter(Boolean)}

      <StudyTimer
        isOpen={timerOpen}
        onClose={handleTimerClose}
        topicName={selectedTopic}
        topicIndex={selectedTopicIndex}
        subjectId={subjectId}
        onSessionComplete={handleSessionComplete}
        isTopicCompleted={selectedTopicIndex !== null && subject?.topics?.[selectedTopicIndex]?.completed}
      />
    </div>
  )
}

export default StudySchedule
