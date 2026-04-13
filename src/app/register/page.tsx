'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Register() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const isLengthValid = password.length >= 8
  const hasNumber = /\d/.test(password)
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password)
  const isPasswordStrong = isLengthValid && hasNumber && hasSymbol

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isPasswordStrong) {
      setError('Please choose a stronger password.')
      return
    }
    setLoading(true)
    setError('')
    
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      const data = await res.json()
      
      if (res.ok) {
        router.push('/login')
      } else {
        setError(data.error || 'Registration failed')
      }
    } catch {
      setError('An unexpected error occurred')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-panel fade-in" style={{ padding: '40px', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '32px', fontSize: '2rem' }}>Create Account</h2>
        {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', marginBottom: '24px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>{error}</div>}
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Username</label>
            <input type="text" className="input" required value={username} onChange={e => setUsername(e.target.value)} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Password</label>
            <input type="password" className="input" required value={password} onChange={e => setPassword(e.target.value)} />
            {password.length > 0 && (
              <div style={{ marginTop: '8px', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ color: isLengthValid ? 'var(--success)' : 'var(--warning)', transition: 'color 0.3s ease' }}>
                  {isLengthValid ? '✓' : '✗'} At least 8 characters
                </div>
                <div style={{ color: hasNumber ? 'var(--success)' : 'var(--warning)', transition: 'color 0.3s ease' }}>
                  {hasNumber ? '✓' : '✗'} Contains a number
                </div>
                <div style={{ color: hasSymbol ? 'var(--success)' : 'var(--warning)', transition: 'color 0.3s ease' }}>
                  {hasSymbol ? '✓' : '✗'} Contains a symbol
                </div>
              </div>
            )}
          </div>
          <button type="submit" className="btn-primary" style={{ marginTop: '12px', display: 'flex', justifyContent: 'center', opacity: isPasswordStrong ? 1 : 0.5 }} disabled={loading || (password.length > 0 && !isPasswordStrong)}>
            {loading ? <div className="spinner"></div> : 'Register'}
          </button>
        </form>
        <p style={{ marginTop: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Already have an account? <Link href="/login" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Sign In</Link>
        </p>
      </div>
    </div>
  )
}
