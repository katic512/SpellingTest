import { WordPerformance, getOverallStats } from '../utils/progressManager'
import '../styles/Dashboard.css'

interface DashboardProps {
  performance: WordPerformance[]
  onReset: () => void
  onExport: () => void
}

export default function Dashboard({ performance, onReset, onExport }: DashboardProps) {
  const stats = getOverallStats(performance)
  
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>📊 Your Progress Dashboard</h2>
        <div className="dashboard-actions">
          <button className="btn-secondary" onClick={onExport}>
            📥 Export
          </button>
          <button className="btn-danger" onClick={onReset}>
            🔄 Reset
          </button>
        </div>
      </div>
      
      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-title">Accuracy</div>
          <div className="stat-big">{stats.accuracy}%</div>
          <div className="stat-subtitle">{stats.totalSuccesses}/{stats.totalAttempts} correct</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-title">Mastered</div>
          <div className="stat-big">{stats.masteredWords}</div>
          <div className="stat-subtitle">Perfect words</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🆕</div>
          <div className="stat-title">New Words</div>
          <div className="stat-big">{stats.newWords}</div>
          <div className="stat-subtitle">Not attempted yet</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-title">In Progress</div>
          <div className="stat-big">{stats.wordsInProgress}</div>
          <div className="stat-subtitle">Being practiced</div>
        </div>
      </div>
      
      <div className="progress-visualization">
        <div className="progress-item">
          <div className="progress-label">✅ Successes: {stats.totalSuccesses}</div>
          <div className="progress-bar">
            <div
              className="progress-fill success"
              style={{
                width: `${stats.totalAttempts > 0 ? (stats.totalSuccesses / stats.totalAttempts) * 100 : 0}%`
              }}
            />
          </div>
        </div>
        
        <div className="progress-item">
          <div className="progress-label">❌ Misses: {stats.totalMisses}</div>
          <div className="progress-bar">
            <div
              className="progress-fill miss"
              style={{
                width: `${stats.totalAttempts > 0 ? (stats.totalMisses / stats.totalAttempts) * 100 : 0}%`
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
