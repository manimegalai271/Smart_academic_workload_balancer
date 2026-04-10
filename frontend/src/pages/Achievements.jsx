import { useState, useEffect } from 'react'

function Achievements() {
  const [streak, setStreak] = useState({ currentStreak: 0, longestStreak: 0 })
  const [badges, setBadges] = useState([])
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const streakResponse = await fetch('/api/activity/streak')
      const streakData = await streakResponse.json()
      setStreak(streakData)

      const badgesResponse = await fetch(`/api/activity/badges?currentStreak=${streakData.currentStreak}`)
      const badgesData = await badgesResponse.json()
      setBadges(badgesData)

      const activityResponse = await fetch('/api/activity')
      const activityData = await activityResponse.json()
      setActivities(activityData)
    } catch (error) {
      console.error('Error fetching achievements:', error)
    }

    setLoading(false)
  }

  const buildActivityMap = () => {
    const map = new Map()

    activities.forEach((activity) => {
      const date = new Date(activity.date)
      date.setHours(0, 0, 0, 0)
      const key = date.toISOString().split('T')[0]

      map.set(key, {
        studied: Boolean(activity.studiedToday),
        topicsCompleted: Number(activity.totalTopicsCompleted || 0),
        studyMinutes: Number(activity.totalStudyMinutes || 0)
      })
    })

    return map
  }

  const getIntensityLevel = (day) => {
    // Topic completion based intensity:
    // 1-7 ticks = little dark green, >7 ticks = dark green.
    const ticks = day.topicsCompleted || 0
    if (ticks > 7) return 4
    if (ticks >= 1) return 2

    // Fallback to study minutes when there are no completion ticks.
    const minutes = day.studyMinutes || 0
    if (minutes === 0) return 0
    if (minutes <= 30) return 1
    if (minutes <= 60) return 2
    if (minutes <= 120) return 3
    return 4
  }

  const getYearCalendar = () => {
    const activityMap = buildActivityMap()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const oneYearAgo = new Date(today)
    oneYearAgo.setDate(oneYearAgo.getDate() - 364)

    const gridStart = new Date(oneYearAgo)
    gridStart.setDate(gridStart.getDate() - gridStart.getDay())

    const days = []
    const cursor = new Date(gridStart)

    while (cursor <= today) {
      const key = cursor.toISOString().split('T')[0]
      const activity = activityMap.get(key)

      days.push({
        date: new Date(cursor),
        studied: activity?.studied || false,
        topicsCompleted: activity?.topicsCompleted || 0,
        studyMinutes: activity?.studyMinutes || 0
      })

      cursor.setDate(cursor.getDate() + 1)
    }

    const weeks = []
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7))
    }

    const monthLabels = []
    const seenMonths = new Set()

    weeks.forEach((week, weekIndex) => {
      const markerDay = week.find((day) => day.date.getDate() <= 7)
      if (!markerDay) return

      const monthKey = `${markerDay.date.getFullYear()}-${markerDay.date.getMonth()}`
      if (seenMonths.has(monthKey)) return

      seenMonths.add(monthKey)
      monthLabels.push({
        weekIndex,
        label: markerDay.date.toLocaleString('default', { month: 'short' })
      })
    })

    return { weeks, monthLabels }
  }

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading achievements...</div>
      </div>
    )
  }

  const { weeks, monthLabels } = getYearCalendar()
  const allDays = weeks.flat()
  const totalMinutesYear = allDays.reduce((sum, day) => sum + (day.studyMinutes || 0), 0)
  const totalHoursYear = Math.round(totalMinutesYear / 60 * 10) / 10
  const activeDays = allDays.filter((day) => day.studied).length

  return (
    <div className="container">
      <div className="achievements-page">
        <h1>Study Achievements</h1>

        <div className="streak-section">
          <div className="streak-card current">
            <div className="streak-icon">??</div>
            <div className="streak-value">{streak.currentStreak}</div>
            <div className="streak-label">Current Streak</div>
          </div>
          <div className="streak-card longest">
            <div className="streak-icon">?</div>
            <div className="streak-value">{streak.longestStreak}</div>
            <div className="streak-label">Longest Streak</div>
          </div>
        </div>

        <div className="badges-section">
          <h2>Your Badges</h2>
          <div className="badges-grid">
            {badges.map((badge, index) => (
              <div key={index} className={`badge-card ${badge.earned ? 'earned' : 'locked'}`}>
                <div className="badge-icon">{badge.icon}</div>
                <div className="badge-name">{badge.name}</div>
                <div className="badge-days">{badge.days} days</div>
                {badge.earned && <div className="badge-earned">✓ Earned</div>}
              </div>
            ))}
          </div>
        </div>

        <div className="activity-section">
          <h2>Study Activity</h2>
          <div className="activity-calendar contribution-style">
            <div className="contribution-header">
              <div className="contribution-title">
                <strong>{totalHoursYear}</strong> hours studied in the past one year
                <span className="info-dot">i</span>
              </div>
              <div className="contribution-controls">
                <div className="contribution-stats">
                  <span>Total active days: <strong>{activeDays}</strong></span>
                  <span>Max streak: <strong>{streak.longestStreak}</strong></span>
                </div>
                <button className="contribution-filter" type="button">
                  Current
                </button>
              </div>
            </div>

            <div className="calendar-scroll">
              <div
                className="calendar-grid year-grid"
                style={{ gridTemplateColumns: `repeat(${weeks.length}, 12px)` }}
              >
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="calendar-week">
                    {week.map((day) => (
                      <div
                        key={day.date.toISOString()}
                        className={`calendar-day level-${getIntensityLevel(day)}`}
                        title={`${day.date.toLocaleDateString()}: ${day.topicsCompleted || 0} topics completed, ${day.studyMinutes || 0} minutes studied`}
                      />
                    ))}
                  </div>
                ))}
              </div>

              <div
                className="month-labels months-bottom"
                style={{ gridTemplateColumns: `repeat(${weeks.length}, 12px)` }}
              >
                {monthLabels.map((month) => (
                  <span key={`${month.label}-${month.weekIndex}`} style={{ gridColumnStart: month.weekIndex + 1 }}>
                    {month.label}
                  </span>
                ))}
              </div>
            </div>

            <div className="calendar-legend">
              <span>Less</span>
              <div className="legend-box level-0"></div>
              <div className="legend-box level-1"></div>
              <div className="legend-box level-2"></div>
              <div className="legend-box level-3"></div>
              <div className="legend-box level-4"></div>
              <span>More</span>
            </div>
          </div>
        </div>

        <div className="motivation-card">
          {streak.currentStreak === 0 ? (
            <p>Start studying today to begin your streak!</p>
          ) : streak.currentStreak < 7 ? (
            <p>Great start! Keep it up to earn your first badge!</p>
          ) : streak.currentStreak < 30 ? (
            <p>You're on fire! {30 - streak.currentStreak} more days to the next badge!</p>
          ) : streak.currentStreak < 50 ? (
            <p>Amazing consistency! Only {50 - streak.currentStreak} days to the Dedicated Scholar badge!</p>
          ) : (
            <p>You're a dedicated scholar! Keep up the excellent work!</p>
          )}
        </div>
      </div>

      <style>{`
        .achievements-page {
          max-width: 1120px;
          margin: 0 auto;
        }

        .achievements-page h1 {
          text-align: center;
          margin-bottom: 30px;
          color: var(--secondary-color);
        }

        .achievements-page h2 {
          color: var(--secondary-color);
          margin-bottom: 20px;
        }

        .streak-section {
          display: flex;
          justify-content: center;
          gap: 30px;
          margin-bottom: 40px;
        }

        .streak-card {
          background: var(--bg-white);
          border-radius: 15px;
          padding: 30px;
          text-align: center;
          box-shadow: var(--shadow);
          min-width: 150px;
        }

        .streak-card.current {
          background: linear-gradient(135deg, #ff6b6b, #ee5a24);
          color: white;
        }

        .streak-card.longest {
          background: linear-gradient(135deg, #ffd93d, #f39c12);
          color: white;
        }

        .streak-icon {
          font-size: 3rem;
          margin-bottom: 10px;
        }

        .streak-value {
          font-size: 3rem;
          font-weight: bold;
        }

        .streak-label {
          font-size: 1rem;
          opacity: 0.9;
        }

        .badges-section {
          margin-bottom: 40px;
        }

        .badges-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
        }

        .badge-card {
          background: var(--bg-white);
          border-radius: 10px;
          padding: 20px;
          text-align: center;
          box-shadow: var(--shadow);
          transition: transform 0.3s;
        }

        .badge-card:hover {
          transform: translateY(-5px);
        }

        .badge-card.locked {
          opacity: 0.5;
          filter: grayscale(1);
        }

        .badge-card.earned {
          border: 2px solid var(--success-color);
        }

        .badge-icon {
          font-size: 2.5rem;
          margin-bottom: 10px;
        }

        .badge-name {
          font-weight: bold;
          margin-bottom: 5px;
          color: var(--secondary-color);
        }

        .badge-days {
          font-size: 0.85rem;
          color: var(--text-light);
        }

        .badge-earned {
          margin-top: 10px;
          color: var(--success-color);
          font-weight: bold;
          font-size: 0.85rem;
        }

        .activity-section {
          margin-bottom: 40px;
        }

        .activity-calendar {
          background: #f6f8fa;
          border: 1px solid #d0d7de;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(31, 35, 40, 0.06);
        }

        .contribution-style {
          padding: 18px 20px 14px;
        }

        .contribution-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 16px;
          color: #57606a;
        }

        .contribution-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.96rem;
          color: #57606a;
        }

        .contribution-title strong {
          color: #24292f;
          font-size: 2.8rem;
          line-height: 1;
          font-weight: 600;
          margin-right: 2px;
        }

        .info-dot {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 1px solid #afb8c1;
          color: #8c959f;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: lowercase;
        }

        .contribution-controls {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .contribution-stats {
          display: flex;
          gap: 18px;
          font-size: 0.88rem;
          color: #6e7781;
          white-space: nowrap;
        }

        .contribution-stats strong {
          color: #24292f;
        }

        .contribution-filter {
          border: 1px solid #d0d7de;
          background: #f6f8fa;
          color: #57606a;
          border-radius: 6px;
          padding: 6px 10px;
          font-size: 0.88rem;
          cursor: default;
        }

        .calendar-scroll {
          overflow-x: auto;
          padding-bottom: 2px;
        }

        .calendar-grid.year-grid {
          display: grid;
          gap: 4px;
          margin-bottom: 10px;
          width: max-content;
        }

        .calendar-week {
          display: grid;
          grid-template-rows: repeat(7, 12px);
          gap: 4px;
        }

        .calendar-day {
          width: 12px;
          height: 12px;
          border-radius: 2px;
          background: #ebedf0;
          cursor: pointer;
          transition: filter 0.15s ease;
        }

        .calendar-day:hover {
          filter: brightness(0.9);
        }

        .calendar-day.level-0,
        .legend-box.level-0 {
          background: #ebedf0;
        }

        .calendar-day.level-1,
        .legend-box.level-1 {
          background: #9be9a8;
        }

        .calendar-day.level-2,
        .legend-box.level-2 {
          background: #40c463;
        }

        .calendar-day.level-3,
        .legend-box.level-3 {
          background: #30a14e;
        }

        .calendar-day.level-4,
        .legend-box.level-4 {
          background: #216e39;
        }

        .month-labels.months-bottom {
          display: grid;
          gap: 4px;
          width: max-content;
          color: #8c959f;
          font-size: 0.8rem;
          line-height: 1;
          margin-bottom: 10px;
        }

        .calendar-legend {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 6px;
          font-size: 0.78rem;
          color: #6e7781;
        }

        .legend-box {
          width: 12px;
          height: 12px;
          border-radius: 2px;
        }

        .motivation-card {
          background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
          color: white;
          border-radius: 10px;
          padding: 20px;
          text-align: center;
          font-size: 1.1rem;
        }

        .loading {
          text-align: center;
          padding: 40px;
          color: var(--text-light);
        }

        @media (max-width: 900px) {
          .contribution-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .contribution-controls {
            width: 100%;
            justify-content: space-between;
          }

          .contribution-stats {
            flex-wrap: wrap;
            gap: 10px 16px;
            white-space: normal;
          }
        }

        @media (max-width: 600px) {
          .streak-section {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
    </div>
  )
}

export default Achievements
