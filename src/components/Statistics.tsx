import { WordPerformance } from '../utils/progressManager'
import '../styles/Statistics.css'

interface StatisticsProps {
  performance: WordPerformance[]
  currentWord: string
}

export default function Statistics({ performance, currentWord }: StatisticsProps) {
  const currentPerf = performance.find(p => p.word === currentWord.toLowerCase())
  
  if (!currentPerf) return null
  
  const total = currentPerf.successes + currentPerf.misses
  const accuracy = total > 0 ? ((currentPerf.successes / total) * 100).toFixed(0) : 'N/A'
  
  // Calculate global stats
  const totalAttempts = performance.reduce((sum, p) => sum + p.successes + p.misses, 0)
  const totalSuccesses = performance.reduce((sum, p) => sum + p.successes, 0)
  const globalAccuracy = totalAttempts > 0 ? ((totalSuccesses / totalAttempts) * 100).toFixed(1) : 0
  
  return (
    <div className="statistics">
      <div className="stat-item">
        <div className="stat-label">This Word</div>
        <div className="stat-value">
          <span className="stat-success">✅ {currentPerf.successes}</span>
          <span className="stat-miss">❌ {currentPerf.misses}</span>
        </div>
      </div>
      
      <div className="stat-item">
        <div className="stat-label">Accuracy</div>
        <div className="stat-value large">{accuracy}%</div>
      </div>
      
      <div className="stat-item">
        <div className="stat-label">Overall</div>
        <div className="stat-value">
          <span className="stat-total">{totalAttempts} attempts</span>
          <span className="stat-rate">{globalAccuracy}% correct</span>
        </div>
      </div>
    </div>
  )
}
