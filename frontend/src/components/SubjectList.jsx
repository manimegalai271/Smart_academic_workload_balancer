import { useState, useEffect } from 'react'

function SubjectList() {
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSubjects()
  }, [])

  const fetchSubjects = async () => {
    try {
      const response = await fetch('/api/subjects')
      const data = await response.json()
      setSubjects(data)
    } catch (error) {
      console.error('Error fetching subjects:', error)
    }
    setLoading(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this subject?')) return
    
    try {
      await fetch(`/api/subjects/${id}`, { method: 'DELETE' })
      fetchSubjects()
    } catch (error) {
      console.error('Error deleting subject:', error)
    }
  }

  const getDeadlineInfo = (subject) => {
    if (!subject.deadline) return null
    
    const deadline = new Date(subject.deadline)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    deadline.setHours(0, 0, 0, 0)
    
    const diffTime = deadline - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) {
      return { text: 'Overdue!', className: 'deadline-overdue' }
    } else if (diffDays === 0) {
      return { text: 'Due today', className: 'deadline-today' }
    } else if (diffDays === 1) {
      return { text: '1 day remaining', className: 'deadline-soon' }
    } else if (diffDays <= 7) {
      return { text: `${diffDays} days remaining`, className: 'deadline-soon' }
    } else {
      return { text: `${diffDays} days remaining`, className: 'deadline-normal' }
    }
  }

  if (loading) return <div>Loading...</div>

  if (subjects.length === 0) {
    return (
      <div className="empty-state">
        <h3>No subjects yet</h3>
        <p>Use the AI Assistant to create your first study plan!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-3">
      {subjects.map(subject => {
        const deadlineInfo = getDeadlineInfo(subject)
        
        return (
          <div key={subject._id} className="subject-card">
            <h3>{subject.name}</h3>
            <p>{subject.description}</p>
            
            {/* Progress Bar */}
            <div className="progress-section">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${subject.progress || 0}%` }}
                ></div>
              </div>
              <p className="progress-text">
                {subject.completedTopics || 0} / {subject.totalTopics || 0} topics ({subject.progress || 0}%)
              </p>
            </div>
            
            {/* Deadline */}
            {deadlineInfo && (
              <div className={`deadline-badge ${deadlineInfo.className}`}>
                📅 {deadlineInfo.text}
              </div>
            )}
            
            <button 
              className="btn btn-primary" 
              onClick={() => handleDelete(subject._id)}
              style={{ marginTop: '10px' }}
            >
              Delete
            </button>
          </div>
        )
      })}
    </div>
  )
}

export default SubjectList

