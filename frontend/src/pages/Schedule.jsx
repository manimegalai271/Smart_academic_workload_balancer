import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import StudySchedule from '../components/StudySchedule'

function Schedule() {
  const [subjects, setSubjects] = useState([])
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchParams] = useSearchParams()

  useEffect(() => {
    fetchSubjects()
  }, [])

  useEffect(() => {
    // Check if subject ID is passed in URL query parameter
    const subjectId = searchParams.get('subject')
    if (subjectId && subjects.length > 0) {
      setSelectedSubject(subjectId)
    }
  }, [searchParams, subjects])

  const fetchSubjects = async () => {
    try {
      const response = await fetch('/api/subjects')
      const data = await response.json()
      setSubjects(data)
      if (data.length > 0 && !selectedSubject) {
        setSelectedSubject(data[0]._id)
      }
    } catch (error) {
      console.error('Error fetching subjects:', error)
    }
    setLoading(false)
  }

  if (loading) return <div className="container">Loading...</div>

  if (subjects.length === 0) {
    return (
      <div className="container">
        <div className="empty-state">
          <h3>📅 No Study Schedules</h3>
          <p>Use the AI Assistant to create a study schedule!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <h1>📅 Study Schedule</h1>
      
      <div className="card" style={{ marginBottom: '20px' }}>
        <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Select Subject:</label>
        <select 
          value={selectedSubject || ''} 
          onChange={(e) => setSelectedSubject(e.target.value)}
          style={{ 
            padding: '10px', 
            borderRadius: '5px', 
            border: '1px solid #ddd',
            fontSize: '1rem'
          }}
        >
          {subjects.map(subject => (
            <option key={subject._id} value={subject._id}>
              {subject.name} ({subject.progress || 0}% complete)
            </option>
          ))}
        </select>
      </div>

      {selectedSubject && (
        <StudySchedule subjectId={selectedSubject} />
      )}
    </div>
  )
}

export default Schedule

