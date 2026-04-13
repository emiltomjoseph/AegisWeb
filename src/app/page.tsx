import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-panel fade-in" style={{ padding: '60px', maxWidth: '800px', textAlign: 'center' }}>
        <h1 style={{ marginBottom: '24px', fontSize: '3.5rem' }}>Defend with AegisWeb</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', marginBottom: '40px', lineHeight: '1.6' }}>
          Experience modern cybersecurity practices in action. Secure authentication, session management, and real-time intrusion anomaly detection in a stunning interface.
        </p>
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
          <Link href="/login">
            <button className="btn-primary" style={{ minWidth: '160px', padding: '16px' }}>Sign In</button>
          </Link>
          <Link href="/register">
            <button className="btn-primary" style={{ minWidth: '160px', padding: '16px', background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)' }}>Create Account</button>
          </Link>
        </div>
      </div>
    </main>
  );
}
