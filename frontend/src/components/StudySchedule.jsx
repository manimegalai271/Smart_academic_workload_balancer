import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import StudyTimer from './StudyTimer'

function StudySchedule({ subjectId }) {
  const [subject, setSubject] = useState(null)
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
      const response = await fetch(`/api/subjects/${subjectId}`)
      const data = await response.json()
      setSubject(data)
    } catch (error) {
      console.error('Error fetching subject:', error)
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

  const handleSessionComplete = () => {
    // Refresh the subject data to update progress
    fetchSubject()
  }

  const handleStartQuiz = () => {
    // Navigate to quiz page with subject data
    navigate('/quiz', {
      state: {
        subjectName: subject.name,
        topics: subject.topics || [],
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
      <p style={{ marginBottom: '20px' }}>
        Progress: {subject.completedTopics || 0} of {subject.totalTopics || 0} topics completed
      </p>
      <p className="timer-hint" style={{ marginBottom: '20px', color: '#666', fontSize: '0.9rem' }}>
        💡 Click on a topic to start a study timer
      </p>

      {/* Quiz Button - Show when all topics are completed */}
      {allTopicsCompleted && (
        <div className="card" style={{ 
          marginBottom: '20px', 
          backgroundColor: '#e8f5e9', 
          border: '2px solid #4caf50',
          textAlign: 'center',
          padding: '20px'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#2e7d32' }}>
            🎉 Congratulations! You've completed all topics!
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

      {Object.entries(topicsByDay || {}).map(([day, topics]) => (
        <div key={day} className="schedule-day">
          <h3>Day {day}</h3>
          <span className="difficulty medium">
            {topics[0]?.difficulty || 'medium'}
          </span>
          <ul className="schedule-topics">
            {topics.map((topic, index) => {
              const globalIndex = subject.topics?.findIndex(t => t === topic)
              const isTimerActive = activeTimerTopic === globalIndex
              return (
                <li 
                  key={index} 
                  className={`topic-item ${topic.completed ? 'completed' : ''} ${isTimerActive ? 'timer-active' : ''}`}
                >
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
      ))}

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
