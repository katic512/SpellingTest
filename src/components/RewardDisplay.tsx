import { useEffect, useState, useRef } from 'react'
import { getStoredUser, getRewardBalance } from '../utils/api'
import '../styles/RewardDisplay.css'

interface RewardData {
  balance_cents: number
  total_earned_cents: number
  total_cashed_out_cents: number
}

// Global event emitter for reward updates
const rewardEmitter = {
  listeners: new Set<() => void>(),
  emit() {
    this.listeners.forEach(listener => listener())
  },
  subscribe(listener: () => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }
}

export { rewardEmitter }

export default function RewardDisplay() {
  const [reward, setReward] = useState<RewardData | null>(null)
  const [loading, setLoading] = useState(true)
  const user = getStoredUser()
  const refreshCounterRef = useRef(0)

  const fetchRewards = async () => {
    try {
      const token = localStorage.getItem('spelling-test-token')
      if (!token) {
        setReward(null)
        setLoading(false)
        return
      }

      const data = await getRewardBalance()
      setReward(data)
    } catch (err) {
      console.error('Failed to fetch balance:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRewards()
    // Refresh every 5 seconds (was 30)
    const interval = setInterval(fetchRewards, 5000)
    
    // Subscribe to reward updates for immediate refresh
    const unsubscribe = rewardEmitter.subscribe(() => {
      refreshCounterRef.current++
      fetchRewards()
    })

    return () => {
      clearInterval(interval)
      unsubscribe()
    }
  }, [])

  if (loading || !reward || !user) return null

  const balanceDollars = (reward.balance_cents / 100).toFixed(2)
  const earnedDollars = (reward.total_earned_cents / 100).toFixed(2)

  return (
    <div className="reward-display">
      <div className="reward-card">
        <div className="reward-header">
          <h3>💰 Rewards</h3>
        </div>
        <div className="reward-content">
          <div className="balance-section">
            <div className="balance-label">Current Balance</div>
            <div className="balance-amount">${balanceDollars}</div>
          </div>
          <div className="stats-section">
            <div className="stat-item">
              <span className="stat-label">Earned</span>
              <span className="stat-value">${earnedDollars}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
