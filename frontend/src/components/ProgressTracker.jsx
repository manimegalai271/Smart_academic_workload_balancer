import { useState, useEffect } from 'react'

function ProgressTracker() {
  const [stats, setStats] = useState({
    totalSubjects: 0,
    totalTopics: 0,
    completedTopics: 0,
    overallProgress: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/progress/stats')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
    setLoading(false)
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <h4>Total Subjects</h4>
        <div className="value">{stats.totalSubjects}</div>
      </div>
      <div className="stat-card">
        <h4>Total Topics</h4>
        <div className="value">{stats.totalTopics}</div>
      </div>
      <div className="stat-card">
        <h4>Completed Topics</h4>
        <div className="value">{stats.completedTopics}</div>
      </div>
      <div className="stat-card">
        <h4>Overall Progress</h4>
        <div className="value">{stats.overallProgress}%</div>
      </div>
    </div>
  )
}

export default ProgressTracker

