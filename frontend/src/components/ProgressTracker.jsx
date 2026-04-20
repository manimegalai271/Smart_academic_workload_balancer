import { useState, useEffect } from 'react'

function ProgressTracker() {
  const [stats, setStats] = useState({
    totalSubjects: 0,
    totalTopics: 0,
    completedTopics: 0,
    overallProgress: 0,
    avgVelocity: 1.0,
    projectedFinish: 'N/A'
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [statsRes, subjectsRes] = await Promise.all([
        fetch('/api/progress/stats'),
        fetch('/api/subjects')
      ])
      const statsData = await statsRes.json()
      const subjects = await subjectsRes.json()

      // Calculate overall velocity (avg across subjects with data)
      let totalVelocity = 0
      let subjectsWithVelocity = 0
      for (const subject of subjects) {
        if (subject.totalTopics > 0 && subject.lastVelocity) {
          const velocityRes = await fetch(`/api/progress/velocity/${subject._id}`)
          if (velocityRes.ok) {
            const velocityData = await velocityRes.json()
            totalVelocity += velocityData.velocity
            subjectsWithVelocity++
          }
        }
      }
      const avgVelocity = subjectsWithVelocity > 0 ? totalVelocity / subjectsWithVelocity : 1.0

      // Overall projected date (simple avg days needed)
      let totalDaysNeeded = 0
      let subjectsNeedingTime = 0
      for (const subject of subjects) {
        if (subject.totalTopics > subject.completedTopics) {
          const velocityRes = await fetch(`/api/progress/velocity/${subject._id}`)
          if (velocityRes.ok) {
            const velocityData = await velocityRes.json()
            totalDaysNeeded += velocityData.daysNeeded
            subjectsNeedingTime++
          }
        }
      }
      const projectedFinish = subjectsNeedingTime > 0 
        ? new Date(Date.now() + totalDaysNeeded * 24 * 60 * 60 * 1000).toLocaleDateString()
        : 'Completed'

      setStats({
        ...statsData,
        avgVelocity: parseFloat(avgVelocity.toFixed(2)),
        projectedFinish
      })
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
      <div className="stat-card velocity-card" style={{ backgroundColor: stats.avgVelocity < 0.8 ? '#ffebee' : stats.avgVelocity > 1.2 ? '#e8f5e9' : '#f5f5f5' }}>
        <h4>🚀 Study Velocity</h4>
        <div className="value">{stats.avgVelocity.toFixed(2)}x <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>{"(" + (stats.avgVelocity > 1 ? 'Fast' : stats.avgVelocity < 0.8 ? 'Slow' : 'On track') + ")"}</span></div>
        <div className="velocity-subtitle" style={{ fontSize: '0.8rem', marginTop: '4px', opacity: 0.8 }}>
          Projected finish: {stats.projectedFinish}
        </div>
      </div>
    </div>
  )
}

export default ProgressTracker

