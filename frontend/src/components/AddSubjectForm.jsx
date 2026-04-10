import { useState } from 'react'

function AddSubjectForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    totalTopics: 7,
    targetDays: 7
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="card">
      <h2>Add New Subject</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Subject Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Operating System"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Brief description of the subject"
            rows="3"
          />
        </div>
        
        <div className="form-group">
          <label>Total Topics</label>
          <input
            type="number"
            value={formData.totalTopics}
            onChange={(e) => setFormData({ ...formData, totalTopics: parseInt(e.target.value) })}
            min="1"
            max="100"
          />
        </div>
        
        <div className="form-group">
          <label>Target Days</label>
          <input
            type="number"
            value={formData.targetDays}
            onChange={(e) => setFormData({ ...formData, targetDays: parseInt(e.target.value) })}
            min="1"
            max="365"
          />
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" className="btn btn-primary">Add Subject</button>
          {onCancel && (
            <button type="button" className="btn" onClick={onCancel}>Cancel</button>
          )}
        </div>
      </form>
    </div>
  )
}

export default AddSubjectForm

