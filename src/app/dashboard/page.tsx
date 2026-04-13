'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

export default function Dashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(res => {
        if (!res.ok) throw new Error('Unauthorized')
        return res.json()
      })
      .then(d => {
        setData(d)
        setLoading(false)
      })
      .catch(() => {
        router.push('/login')
      })
  }, [router])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" style={{ width: '40px', height: '40px' }}></div></div>
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }} className="fade-in">
      <aside className="glass-panel" style={{ width: '280px', borderRadius: '0', borderLeft: 'none', borderTop: 'none', borderBottom: 'none', padding: '32px 24px', display: 'flex', flexDirection: 'column', zIndex: 10 }}>
        <h2 style={{ color: 'var(--primary)', borderBottom: '1px solid var(--border)', paddingBottom: '24px', marginBottom: '32px' }}>AegisWeb</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
          <a href="#" style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: 500, padding: '12px', background: 'var(--surface-hover)', borderRadius: '8px' }}>Security Dashboard</a>
        </nav>
        <button onClick={handleLogout} className="btn-primary" style={{ background: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)', boxShadow: 'none' }}>Logout</button>
      </aside>

      <main style={{ flex: 1, padding: '40px', paddingBottom: '60px', overflowY: 'auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Overview</h1>
            {data.lastLogin && (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Last login: {new Date(data.lastLogin.timestamp).toLocaleString()} {data.lastLogin.ipAddress && data.lastLogin.ipAddress !== 'unknown' && `(IP: ${data.lastLogin.ipAddress})`}
              </div>
            )}
          </div>
          <div style={{ padding: '8px 16px', background: 'var(--surface)', borderRadius: '20px', fontSize: '0.875rem', border: '1px solid var(--border)' }}>System Status: <span style={{ color: 'var(--success)' }}>Active</span></div>
        </header>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '40px' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>Total Users</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700 }}>{data.totalUsers}</div>
          </div>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>Total Login Attempts</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary)' }}>{data.totalLogins}</div>
          </div>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>Failed Attempts</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--warning)' }}>{data.failedLogins}</div>
          </div>
        </div>

        {/* Chart */}
        <div className="glass-panel" style={{ padding: '32px', marginBottom: '40px', height: '400px' }}>
          <h3 style={{ marginBottom: '24px' }}>Authentication Activity (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="var(--text-muted)" />
              <YAxis stroke="var(--text-muted)" />
              <Tooltip contentStyle={{ backgroundColor: 'var(--surface-hover)', borderColor: 'var(--border)', borderRadius: '8px' }} itemStyle={{ color: 'var(--text-main)' }} />
              <Line type="monotone" dataKey="success" stroke="var(--success)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Successful" />
              <Line type="monotone" dataKey="fail" stroke="var(--danger)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Failed" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Suspicious Activities */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ marginBottom: 0 }}>Recent Suspicious Activity</h3>
            <a href="/api/dashboard/export" className="btn-primary" style={{ textDecoration: 'none', padding: '8px 16px', fontSize: '0.9rem', display: 'inline-block' }}>Download Logs (CSV)</a>
          </div>
          <div className="glass-panel" style={{ overflow: 'hidden' }}>
            {data.suspiciousActivities.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>No suspicious patterns detected recently.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'var(--surface-hover)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 500 }}>Time</th>
                    <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 500 }}>IP Source</th>
                    <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 500 }}>Description</th>
                    <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 500 }}>Threat Level</th>
                  </tr>
                </thead>
                <tbody>
                  {data.suspiciousActivities.map((sa: any) => (
                    <tr key={sa.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s ease' }}>
                      <td style={{ padding: '16px 24px' }}>{new Date(sa.timestamp).toLocaleString()}</td>
                      <td style={{ padding: '16px 24px', fontFamily: 'monospace' }}>{sa.ipAddress || 'Unknown'}</td>
                      <td style={{ padding: '16px 24px' }}>{sa.description}</td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ 
                          padding: '4px 8px', borderRadius: '4px', fontSize: '0.875rem', fontWeight: 600,
                          background: sa.severity === 'CRITICAL' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                          color: sa.severity === 'CRITICAL' ? 'var(--danger)' : 'var(--warning)'
                        }}>
                          {sa.severity}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
