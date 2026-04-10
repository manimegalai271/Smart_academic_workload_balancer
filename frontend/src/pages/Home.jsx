import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className="container">
      <div className="hero">
        <h1>🎓 Smart Academic Workload Balancer</h1>
        <p>
          AI-powered study planner that breaks difficult subjects into manageable topics,
          creates balanced schedules, and tracks your progress.
        </p>
        <Link to="/dashboard" className="btn btn-primary hero-cta">
          Get Started
        </Link>
      </div>

      <div className="features">
        <div className="feature-card">
          <h3>🤖 AI Assistant</h3>
          <p>Chat with our AI to create personalized study plans instantly</p>
        </div>
        <div className="feature-card">
          <h3>📊 Smart Scheduling</h3>
          <p>Balanced workload distribution across your study days</p>
        </div>
        <div className="feature-card">
          <h3>✅ Progress Tracking</h3>
          <p>Track completion percentage and stay motivated</p>
        </div>
        <div className="feature-card">
          <h3>⏰ Deadline Management</h3>
          <p>Complete your syllabus on time with smart planning</p>
        </div>
      </div>

      <div className="card" style={{ marginTop: '40px' }}>
        <h2>How It Works</h2>
        <ol style={{ marginLeft: '20px', lineHeight: '2' }}>
          <li>Open the AI Assistant (bottom-right corner)</li>
          <li>Tell it what you want to study and how many days you have</li>
          <li>AI creates a balanced study schedule with topics</li>
          <li>Mark topics as completed to track your progress</li>
          <li>Receive tips to prevent study burnout</li>
        </ol>
      </div>
    </div>
  )
}

export default Home

