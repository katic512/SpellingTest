import { useState, useRef } from 'react'
import '../styles/CashoutModal.css'

interface CashoutModalProps {
  isOpen: boolean
  balance_cents: number
  onClose: () => void
  onSuccess?: () => void
}

export default function CashoutModal({ isOpen, balance_cents, onClose, onSuccess }: CashoutModalProps) {
  const [amount, setAmount] = useState<number | ''>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showBill, setShowBill] = useState(false)
  const [hasPrinted, setHasPrinted] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  const balanceDollars = Math.floor(balance_cents / 100)
  const maxAmount = balanceDollars

  const handleCashout = async () => {
    try {
      setError(null)
      setLoading(true)

      if (!amount || amount < 1 || amount > maxAmount) {
        setError(`Please enter an amount between $1 and $${maxAmount}`)
        return
      }

      if (!Number.isInteger(amount)) {
        setError('Please enter a whole dollar amount')
        return
      }

      const token = localStorage.getItem('spelling-test-token')
      if (!token) {
        setError('Not authenticated')
        return
      }

      const res = await fetch('/api/rewards/cashout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ amount_dollars: amount })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Cashout failed')
      }

      setSuccess(true)
      setShowBill(true)
      setHasPrinted(false)

      setTimeout(() => {
        setShowBill(false)
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cashout failed')
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=800,height=600')
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Cashout Receipt</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                padding: 40px;
                background: white;
              }
              .receipt {
                max-width: 600px;
                margin: 0 auto;
                border: 2px solid #333;
                padding: 30px;
                text-align: center;
                background: #f9f9f9;
              }
              .receipt-header {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 20px;
                border-bottom: 2px solid #333;
                padding-bottom: 15px;
              }
              .receipt-body {
                margin: 30px 0;
                font-size: 18px;
              }
              .amount {
                font-size: 48px;
                font-weight: bold;
                color: #2ecc71;
                margin: 30px 0;
              }
              .receipt-footer {
                margin-top: 30px;
                border-top: 2px solid #333;
                padding-top: 15px;
                font-size: 12px;
                color: #666;
              }
              .timestamp {
                font-size: 14px;
                margin: 10px 0;
              }
            </style>
          </head>
          <body>
            <div class="receipt">
              <div class="receipt-header">💰 CASHOUT RECEIPT</div>
              <div class="receipt-body">
                <p>Amount Cashed Out:</p>
                <div class="amount">$${Number(amount).toFixed(2)}</div>
                <p class="timestamp">Date: ${new Date().toLocaleString()}</p>
              </div>
              <div class="receipt-footer">
                <p>Thank you for using Spelling Test Rewards!</p>
                <p>Keep your receipt for your records.</p>
              </div>
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
      
      // Mark as printed after a short delay to allow print dialog to appear
      setTimeout(() => {
        setHasPrinted(true)
      }, 100)
      
      // Trigger print dialog
      printWindow.focus()
      printWindow.print()
    }
  }

  if (!isOpen) return null

  return (
    <div className="cashout-modal-overlay" onClick={onClose}>
      <div className="cashout-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>💵 Cash Out</h2>
          <button className="close-btn" onClick={onClose} disabled={loading || (success && !hasPrinted)}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {!success ? (
            <>
              <div className="balance-info">
                <p className="info-label">Available Balance</p>
                <p className="info-amount">${balanceDollars.toFixed(2)}</p>
              </div>

              <div className="input-group">
                <label htmlFor="amount">Amount to Cash Out</label>
                <div className="amount-input-wrapper">
                  <span className="currency-symbol">$</span>
                  <input
                    id="amount"
                    type="number"
                    min="1"
                    max={maxAmount}
                    value={amount}
                    onChange={(e) => {
                      const val = e.target.value
                      setAmount(val === '' ? '' : Math.floor(Number(val)))
                      setError(null)
                    }}
                    placeholder="Enter amount"
                    disabled={loading}
                  />
                </div>
              </div>

              {error && <div className="error-message">{error}</div>}

              <div className="quick-amounts">
                <p className="quick-label">Quick amounts:</p>
                <div className="quick-buttons">
                  {[1, 5, 10].map((amt) => (
                    <button
                      key={amt}
                      className="quick-btn"
                      onClick={() => {
                        setAmount(amt)
                        setError(null)
                      }}
                      disabled={loading || amt > maxAmount}
                    >
                      ${amt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn-cancel" onClick={onClose} disabled={loading}>
                  Cancel
                </button>
                <button
                  className="btn-cashout"
                  onClick={handleCashout}
                  disabled={loading || !amount || amount < 1 || amount > maxAmount}
                >
                  {loading ? 'Processing...' : 'Cash Out'}
                </button>
              </div>
            </>
          ) : (
            <div className="success-message">
              <div className="success-icon">✓</div>
              <h3>Cashout Successful!</h3>
              <p>Amount: ${Number(amount).toFixed(2)}</p>

              <div ref={printRef} className="receipt-preview">
                <div className="receipt-content">
                  <div className="receipt-header-text">💰 CASHOUT RECEIPT</div>
                  <div className="receipt-amount">${Number(amount).toFixed(2)}</div>
                  <p className="receipt-date">Date: {new Date().toLocaleString()}</p>
                  <p className="receipt-footer-text">Thank you for using Spelling Test Rewards!</p>
                </div>
              </div>

              {showBill && (
                <div className="dollar-bill">
                  <div className="bill-front">
                    <div className="bill-top">
                      <span className="bill-text">ONE DOLLAR</span>
                    </div>
                    <div className="bill-center">
                      <span className="bill-amount">$</span>
                    </div>
                    <div className="bill-bottom">
                      <span className="bill-text">ONE DOLLAR</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="receipt-actions">
                <button
                  className="btn-print"
                  onClick={handlePrint}
                  disabled={hasPrinted}
                >
                  {hasPrinted ? '✓ Printed' : '🖨️ Print Receipt'}
                </button>
                <button
                  className={`btn-close-receipt ${hasPrinted ? 'enabled' : 'disabled'}`}
                  onClick={() => {
                    onSuccess?.()
                    setAmount('')
                    setSuccess(false)
                    setHasPrinted(false)
                    onClose()
                  }}
                  disabled={!hasPrinted}
                >
                  {hasPrinted ? '✓ Done - Close' : 'Print First'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
