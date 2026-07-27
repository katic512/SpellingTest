import { FormEvent, useEffect, useMemo, useState } from 'react'
import {
  AdminWord,
  createAdminWord,
  deleteAdminWord,
  fetchAdminWords,
  updateAdminWord,
  getAdminUsersRewards,
  updateUserRewards,
  UserReward,
  getAdminUsers,
  deleteAdminUser,
  toggleUserStatus,
  UserManagement
} from '../utils/api'
import { useAuth } from '../auth/AuthContext'
import './AdminWords.css'

interface AdminWordsProps {
  onBack: () => void
}

export default function AdminWords({ onBack }: AdminWordsProps) {
  const { logout, user } = useAuth()
  const [tab, setTab] = useState<'words' | 'rewards' | 'users'>('words')
  const [words, setWords] = useState<AdminWord[]>([])
  const [users, setUsers] = useState<UserReward[]>([])
  const [managedUsers, setManagedUsers] = useState<UserManagement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [newWord, setNewWord] = useState('')
  const [newDefinition, setNewDefinition] = useState('')
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editWord, setEditWord] = useState('')
  const [editDefinition, setEditDefinition] = useState('')
  const [fetchingDefId, setFetchingDefId] = useState<number | null>(null)
  const [editingUserId, setEditingUserId] = useState<number | null>(null)
  const [editBalance, setEditBalance] = useState('')
  const [success, setSuccess] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      if (tab === 'words') {
        setWords(await fetchAdminWords())
      } else if (tab === 'rewards') {
        setUsers(await getAdminUsersRewards())
      } else if (tab === 'users') {
        setManagedUsers(await getAdminUsers())
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to load ${tab}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [tab])

  const handleFetchDefinition = async (id: number, currentDef: string | null) => {
    if (currentDef && currentDef.trim()) {
      setError('Definition already exists. Clear it first if you want to refetch from API.')
      return
    }

    setFetchingDefId(id)
    setError(null)
    setSuccess(null)
    try {
      const wordRow = words.find(w => w.id === id)
      if (!wordRow) return

      const res = await fetch(`/api/words/${encodeURIComponent(wordRow.word)}/definition`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('spelling-test-token')}` }
      })
      if (!res.ok) throw new Error('Failed to fetch definition')
      const data = await res.json()
      const definition = data.definition as string | null

      if (definition) {
        const updated = await updateAdminWord(id, { definition })
        setWords(prev => prev.map(w => (w.id === updated.id ? updated : w)))
        setSuccess(`Definition fetched for "${wordRow.word}"`)
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(`No definition found in API for "${wordRow.word}"`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch definition')
    } finally {
      setFetchingDefId(null)
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return words
    return words.filter(
      w =>
        w.word.includes(q) ||
        (w.definition ?? '').toLowerCase().includes(q)
    )
  }, [words, search])

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault()
    if (!newWord.trim()) return
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const created = await createAdminWord(newWord.trim(), newDefinition.trim() || undefined)
      setWords(prev => [...prev, created].sort((a, b) => a.word.localeCompare(b.word)))
      setNewWord('')
      setNewDefinition('')
      setSuccess(`Word "${created.word}" added successfully`)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add word')
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (row: AdminWord) => {
    setEditingId(row.id)
    setEditWord(row.word)
    setEditDefinition(row.definition ?? '')
    setSuccess(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditWord('')
    setEditDefinition('')
  }

  const saveEdit = async () => {
    if (editingId == null || !editWord.trim()) return
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const updated = await updateAdminWord(editingId, {
        word: editWord.trim(),
        definition: editDefinition.trim() || null
      })
      setWords(prev =>
        prev
          .map(w => (w.id === updated.id ? updated : w))
          .sort((a, b) => a.word.localeCompare(b.word))
      )
      setSuccess(`Word updated successfully`)
      setTimeout(() => setSuccess(null), 3000)
      cancelEdit()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update word')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (row: AdminWord) => {
    if (!window.confirm(`Delete "${row.word}"? This also removes user progress for that word.`)) {
      return
    }
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      await deleteAdminWord(row.id)
      setWords(prev => prev.filter(w => w.id !== row.id))
      if (editingId === row.id) cancelEdit()
      setSuccess(`Word "${row.word}" deleted successfully`)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete word')
    } finally {
      setSaving(false)
    }
  }

  const startEditUser = (userReward: UserReward) => {
    setEditingUserId(userReward.id)
    setEditBalance((userReward.balance_cents / 100).toFixed(2))
    setSuccess(null)
  }

  const cancelEditUser = () => {
    setEditingUserId(null)
    setEditBalance('')
  }

  const saveEditUser = async () => {
    if (editingUserId == null) return
    const balanceCents = Math.round(parseFloat(editBalance || '0') * 100)
    if (balanceCents < 0) {
      setError('Balance cannot be negative')
      return
    }
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const updated = await updateUserRewards(editingUserId, { balance_cents: balanceCents })
      setUsers(prev =>
        prev
          .map(u => (u.id === updated.id ? updated : u))
          .sort((a, b) => a.username.localeCompare(b.username))
      )
      setSuccess(`Balance updated successfully`)
      setTimeout(() => setSuccess(null), 3000)
      cancelEditUser()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update balance')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteUser = async (managedUser: UserManagement) => {
    if (!window.confirm(`Delete user "${managedUser.username}"? This cannot be undone.`)) {
      return
    }
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      await deleteAdminUser(managedUser.id)
      setManagedUsers(prev => prev.filter(u => u.id !== managedUser.id))
      setSuccess(`User "${managedUser.username}" deleted successfully`)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleUserStatus = async (managedUser: UserManagement) => {
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const updated = await toggleUserStatus(managedUser.id, !managedUser.is_enabled)
      setManagedUsers(prev =>
        prev
          .map(u => (u.id === updated.id ? updated : u))
          .sort((a, b) => a.username.localeCompare(b.username))
      )
      const action = !managedUser.is_enabled ? 'enabled' : 'disabled'
      setSuccess(`User "${managedUser.username}" ${action}`)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user status')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-words">
      <div className="admin-header">
        <div>
          <h1>Admin</h1>
          <p className="admin-subtitle">
            Signed in as {user?.username} · {tab === 'words' ? `${words.length} words` : tab === 'rewards' ? `${users.length} users` : `${managedUsers.length} accounts`}
          </p>
        </div>
        <div className="admin-header-actions">
          <button
            type="button"
            className={`admin-btn ${tab === 'words' ? 'admin-btn-active' : ''}`}
            onClick={() => setTab('words')}
          >
            📚 Vocabulary
          </button>
          <button
            type="button"
            className={`admin-btn ${tab === 'rewards' ? 'admin-btn-active' : ''}`}
            onClick={() => setTab('rewards')}
          >
            💰 Rewards
          </button>
          <button
            type="button"
            className={`admin-btn ${tab === 'users' ? 'admin-btn-active' : ''}`}
            onClick={() => setTab('users')}
          >
            👥 Users
          </button>
          <button type="button" className="admin-btn" onClick={onBack}>
            ← Practice
          </button>
          <button type="button" className="admin-btn admin-btn-muted" onClick={logout}>
            Sign out
          </button>
        </div>
      </div>

      {error && <div className="admin-error">{error}</div>}
      {success && <div className="admin-success">{success}</div>}

      {tab === 'words' ? (
        <>
          <form className="admin-add" onSubmit={handleAdd}>
            <h2>Add word</h2>
            <div className="admin-add-row">
              <input
                className="admin-input"
                placeholder="Spelling"
                value={newWord}
                onChange={e => setNewWord(e.target.value)}
                disabled={saving}
                required
              />
              <input
                className="admin-input admin-input-wide"
                placeholder="Meaning (optional — fetched from API if blank)"
                value={newDefinition}
                onChange={e => setNewDefinition(e.target.value)}
                disabled={saving}
              />
              <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
                Add
              </button>
            </div>
          </form>

          <div className="admin-toolbar">
            <input
              className="admin-input"
              placeholder="Search words or meanings…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button type="button" className="admin-btn admin-btn-muted" onClick={load} disabled={loading}>
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="admin-loading">Loading vocabulary…</div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Word</th>
                    <th>Meaning</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(row => (
                    <tr key={row.id} className={!row.definition ? 'admin-row-missing-def' : ''}>
                      {editingId === row.id ? (
                        <>
                          <td>
                            <input
                              className="admin-input"
                              value={editWord}
                              onChange={e => setEditWord(e.target.value)}
                              disabled={saving}
                            />
                          </td>
                          <td>
                            <textarea
                              className="admin-textarea"
                          value={editDefinition}
                          onChange={e => setEditDefinition(e.target.value)}
                          disabled={saving}
                          rows={2}
                        />
                      </td>
                      <td className="admin-actions">
                        <button
                          type="button"
                          className="admin-btn admin-btn-primary"
                          onClick={saveEdit}
                          disabled={saving}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className="admin-btn admin-btn-muted"
                          onClick={cancelEdit}
                          disabled={saving}
                        >
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="admin-word-cell">{row.word}</td>
                      <td className="admin-def-cell">
                        {row.definition ? (
                          row.definition
                        ) : (
                          <span className="admin-missing">No meaning yet</span>
                        )}
                      </td>
                      <td className="admin-actions">
                        <button
                          type="button"
                          className="admin-btn"
                          onClick={() => startEdit(row)}
                          disabled={saving}
                        >
                          Edit
                        </button>
                        {!row.definition && (
                          <button
                            type="button"
                            className="admin-btn admin-btn-secondary"
                            onClick={() => handleFetchDefinition(row.id, row.definition)}
                            disabled={saving || fetchingDefId === row.id}
                          >
                            {fetchingDefId === row.id ? '⟳' : 'Fetch'}
                          </button>
                        )}
                        <button
                          type="button"
                          className="admin-btn admin-btn-danger"
                          onClick={() => handleDelete(row)}
                          disabled={saving}
                        >
                          Delete
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={3} className="admin-empty">
                    No matching words
                  </td>
                </tr>
              )}
            </tbody>
              </table>
            </div>
          )}
        </>
      ) : tab === 'rewards' ? (
        <>
          <div className="admin-toolbar">
            <input
              className="admin-input"
              placeholder="Search users…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button type="button" className="admin-btn admin-btn-muted" onClick={load} disabled={loading}>
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="admin-loading">Loading users…</div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Balance</th>
                    <th>Earned</th>
                    <th>Cashed Out</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users
                    .filter(u => u.username.toLowerCase().includes(search.toLowerCase()))
                    .map(userRow => (
                      <tr key={userRow.id}>
                        <td>{userRow.username}</td>
                        {editingUserId === userRow.id ? (
                          <>
                            <td>
                              <input
                                type="number"
                                step="0.01"
                                className="admin-input"
                                value={editBalance}
                                onChange={e => setEditBalance(e.target.value)}
                                disabled={saving}
                              />
                            </td>
                            <td className="admin-money">${(userRow.total_earned_cents / 100).toFixed(2)}</td>
                            <td className="admin-money">${(userRow.total_cashed_out_cents / 100).toFixed(2)}</td>
                            <td>
                              <button
                                type="button"
                                className="admin-action-btn"
                                onClick={saveEditUser}
                                disabled={saving}
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                className="admin-action-btn"
                                onClick={cancelEditUser}
                                disabled={saving}
                              >
                                Cancel
                              </button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="admin-money">${(userRow.balance_cents / 100).toFixed(2)}</td>
                            <td className="admin-money">${(userRow.total_earned_cents / 100).toFixed(2)}</td>
                            <td className="admin-money">${(userRow.total_cashed_out_cents / 100).toFixed(2)}</td>
                            <td>
                              <button
                                type="button"
                                className="admin-action-btn"
                                onClick={() => startEditUser(userRow)}
                                disabled={saving}
                              >
                                Edit
                              </button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  {users.filter(u => u.username.toLowerCase().includes(search.toLowerCase())).length === 0 && (
                    <tr>
                      <td colSpan={5} className="admin-empty">
                        No users
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="admin-toolbar">
            <input
              className="admin-input"
              placeholder="Search users…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button type="button" className="admin-btn admin-btn-muted" onClick={load} disabled={loading}>
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="admin-loading">Loading users…</div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {managedUsers
                    .filter(u => u.username.toLowerCase().includes(search.toLowerCase()))
                    .sort((a, b) => a.username.localeCompare(b.username))
                    .map(managedUser => (
                      <tr key={managedUser.id}>
                        <td className="admin-username">{managedUser.username}</td>
                        <td className="admin-role">{managedUser.role}</td>
                        <td>
                          <span className={`admin-status ${managedUser.is_enabled ? 'admin-status-enabled' : 'admin-status-disabled'}`}>
                            {managedUser.is_enabled ? '✓ Enabled' : '✗ Disabled'}
                          </span>
                        </td>
                        <td className="admin-date">{new Date(managedUser.created_at).toLocaleDateString()}</td>
                        <td className="admin-actions">
                          <button
                            type="button"
                            className={`admin-btn ${managedUser.is_enabled ? 'admin-btn-secondary' : 'admin-btn-primary'}`}
                            onClick={() => handleToggleUserStatus(managedUser)}
                            disabled={saving}
                          >
                            {managedUser.is_enabled ? 'Disable' : 'Enable'}
                          </button>
                          <button
                            type="button"
                            className="admin-btn admin-btn-danger"
                            onClick={() => handleDeleteUser(managedUser)}
                            disabled={saving}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  {managedUsers.filter(u => u.username.toLowerCase().includes(search.toLowerCase())).length === 0 && (
                    <tr>
                      <td colSpan={5} className="admin-empty">
                        No users
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
