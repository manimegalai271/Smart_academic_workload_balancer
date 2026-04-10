import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        📚 Smart Study Balancer
      </Link>
      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/schedule">Schedule</Link>
        <Link to="/achievements">🏆 Achievements</Link>
      </div>
    </nav>
  )
}

export default Navbar

