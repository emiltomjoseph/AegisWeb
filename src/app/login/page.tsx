'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      const data = await res.json()
      
      if (res.ok) {
        router.push('/dashboard')
      } else {
        setError(data.error || 'Login failed')
      }
    } catch {
      setError('An unexpected error occurred')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-panel fade-in" style={{ padding: '40px', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '32px', fontSize: '2rem' }}>Welcome Back</h2>
        {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', marginBottom: '24px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>{error}</div>}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Username</label>
            <input type="text" className="input" required value={username} onChange={e => setUsername(e.target.value)} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Password</label>
            <input type="password" className="input" required value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary" style={{ marginTop: '12px', display: 'flex', justifyContent: 'center' }} disabled={loading}>
            {loading ? <div className="spinner"></div> : 'Sign In'}
          </button>
        </form>
        <p style={{ marginTop: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
          New around here? <Link href="/register" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Create an account</Link>
        </p>
      </div>
    </div>
  )
}
