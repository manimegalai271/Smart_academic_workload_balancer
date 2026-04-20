import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ProgressTracker from '../components/ProgressTracker'
import SubjectList from '../components/SubjectList'

function Dashboard() {
  const [subjects, setSubjects] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [graphLoading, setGraphLoading] = useState(false)
  const [graphData, setGraphData] = useState({ graph: [], warnings: [], suggestedOrder: '', hasCycle: false })
  const [editingSubject, setEditingSubject] = useState(null)
  const navigate = useNavigate()

  const fetchGraph = async () => {
    setGraphLoading(true)
    try {
      const res = await fetch('/api/subjects/graph')
      const data = await res.json()
      setGraphData(data)
    } catch (error) {
      console.error('Error fetching graph:', error)
    }
    setGraphLoading(false)
  }

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

  const handleAddSubject = async (formData) => {
    try {
      const response = await fetch('/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        fetchSubjects()
        setShowAddForm(false)
      } else {
        const error = await response.json()
        alert(error.error || 'Error adding subject')
      }
    } catch (error) {
      console.error('Error adding subject:', error)
    }
  }

  const handleEditSubject = async (formData) => {
    try {
      const response = await fetch(`/api/subjects/${editingSubject._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        fetchSubjects()
        setEditingSubject(null)
      }
    } catch (error) {
      console.error('Error updating subject:', error)
    }
  }

  const handleDeleteSubject = async (id) => {
    if (!confirm('Are you sure you want to delete this subject? All progress will be lost.')) return
    
    try {
      await fetch(`/api/subjects/${id}`, { method: 'DELETE' })
      fetchSubjects()
    } catch (error) {
      console.error('Error deleting subject:', error)
    }
  }

  const handleSubjectClick = (subjectId) => {
    navigate(`/schedule?subject=${subjectId}`)
  }

  return (
    <div className="container">
      <div className="dashboard-header">
        <h1>📊 Dashboard</h1>
        <button 
          className="btn btn-primary" 
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Cancel' : '+ Add Subject'}
        </button>
      </div>

      <ProgressTracker />

      {showAddForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h2>Add New Subject</h2>
          <form onSubmit={(e) => {
            e.preventDefault()
            const formData = {
              name: e.target.name.value,
              description: e.target.description.value,
              totalTopics: parseInt(e.target.totalTopics.value),
              targetDays: parseInt(e.target.targetDays.value)
            }
            handleAddSubject(formData)
          }}>
            <div className="form-group">
              <label>Subject Name</label>
              <input name="name" type="text" placeholder="e.g., Operating System" required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <input name="description" type="text" placeholder="Brief description" />
            </div>
            <div className="form-group">
              <label>Total Topics</label>
              <input name="totalTopics" type="number" defaultValue="7" min="1" />
            </div>
            <div className="form-group">
              <label>Target Days</label>
              <input name="targetDays" type="number" defaultValue="7" min="1" />
            </div>
            <button type="submit" className="btn btn-primary">Add Subject</button>
          </form>
        </div>
      )}

      {editingSubject && (
        <div className="card" style={{ marginBottom: '20px', border: '2px solid #3498db' }}>
          <h2>Edit Subject</h2>
          <form onSubmit={(e) => {
            e.preventDefault()
            const formData = {
              name: e.target.name.value,
              description: e.target.description.value,
              totalTopics: parseInt(e.target.totalTopics.value),
              targetDays: parseInt(e.target.targetDays.value)
            }
            handleEditSubject(formData)
          }}>
            <div className="form-group">
              <label>Subject Name</label>
              <input name="name" type="text" defaultValue={editingSubject.name} required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <input name="description" type="text" defaultValue={editingSubject.description} />
            </div>
            <div className="form-group">
              <label>Total Topics</label>
              <input name="totalTopics" type="number" defaultValue={editingSubject.totalTopics} min="1" />
            </div>
            <div className="form-group">
              <label>Target Days</label>
              <input name="targetDays" type="number" defaultValue={editingSubject.targetDays} min="1" />
            </div>
            <button type="submit" className="btn btn-primary">Save Changes</button>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => setEditingSubject(null)}
              style={{ marginLeft: '10px' }}
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* Dependency Graph Section */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h2>📊 Study Dependencies</h2>
        <button 
          className="btn btn-info mb-3" 
          onClick={fetchGraph}
          style={{ fontSize: '0.9rem' }}
        >
          Refresh Graph
        </button>
        {graphLoading ? (
          <p>Loading graph...</p>
        ) : graphData.warnings.length > 0 ? (
          <div className="alert alert-warning">
            <h4>⚠️ Graph Warnings:</h4>
            <ul>
              {graphData.warnings.map((warning, i) => <li key={i}>{warning}</li>)}
            </ul>
          </div>
        ) : (
          <p className="text-muted">No dependencies detected. All subjects ready! ✅</p>
        )}
        {graphData.suggestedOrder && (
          <div>
            <strong>Suggested Order:</strong> {graphData.suggestedOrder}
          </div>
        )}
      </div>

      <div className="card">
        <h2>Your Subjects</h2>
        {loading ? (
          <p>Loading...</p>
        ) : subjects.length === 0 ? (
          <div className="empty-state">
            <h3>No subjects yet</h3>
            <p>Use the AI Assistant (bottom-right) to create your first study plan!</p>
          </div>
        ) : (
          <div className="grid grid-3">
            {subjects.map(subject => {
              const isLocked = subject.prerequisites && subject.prerequisites.length > 0 && graphData.graph.find(g => g.id === subject._id.toString())?.status === 'locked';
              return (
                <div 
                  key={subject._id} 
                  className={`subject-card ${isLocked ? 'locked-subject' : ''}`}
                  onClick={() => !isLocked && handleSubjectClick(subject._id)}
                  style={{ cursor: isLocked ? 'not-allowed' : 'pointer', opacity: isLocked ? 0.6 : 1 }}
                >
                  {isLocked && (
                    <div className="lock-badge" style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: 'red',
                      color: 'white',
                      borderRadius: '50%',
                      width: '30px',
                      height: '30px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      fontWeight: 'bold'
                    }}>
                      🔒
                    </div>
                  )}
                  <h3>{subject.name}</h3>
                  <p>{subject.description}</p>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${subject.progress || 0}%` }}
                    ></div>
                  </div>
                  <p className="progress-text">
                    {subject.completedTopics || 0} / {subject.totalTopics || 0} topics ({subject.progress || 0}%)
                  </p>
                  <p style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>
                    Target: {subject.targetDays} days {subject.prerequisites?.length > 0 && `| Prereqs: ${subject.prerequisites.length}`}
                  </p>
                  {!isLocked ? (
                    <div 
                      className="subject-actions" 
                      onClick={(e) => e.stopPropagation()}
                      style={{ marginTop: '10px', display: 'flex', gap: '10px' }}
                    >
                      <button 
                        className="btn btn-primary" 
                        onClick={() => setEditingSubject(subject)}
                        style={{ flex: 1, fontSize: '0.85rem' }}
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        className="btn btn-danger" 
                        onClick={() => handleDeleteSubject(subject._id)}
                        style={{ flex: 1, fontSize: '0.85rem' }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', marginTop: '10px', color: '#666', fontSize: '0.85rem' }}>
                      🔒 Complete prerequisites first
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard

