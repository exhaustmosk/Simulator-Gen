import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Shield, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.detail || 'Failed to register')
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      window.location.href = '/dashboard'
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10vh 5vw', background: 'var(--bg-primary)', position: 'relative', overflow: 'hidden' }}>
      
      {/* Decorative Blur */}
      <div style={{ position: 'absolute', top: '50%', right: '0%', transform: 'translate(20%, -50%)', width: '50vw', height: '50vw', borderRadius: '50%', background: 'rgba(0, 219, 117, 0.15)', filter: 'blur(150px)', opacity: 0.6, zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '40vw', height: '40vw', borderRadius: '50%', background: 'var(--bg-purple)', filter: 'blur(150px)', opacity: 0.4, zIndex: 0 }} />

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="glass-box" 
        style={{ width: '100%', maxWidth: '440px', padding: '48px', borderRadius: '32px', zIndex: 10, background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(40px)', border: '1px solid rgba(255,255,255,0.4)', boxShadow: '0 20px 60px rgba(0,0,0,0.05)' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', padding: '16px', background: 'var(--bg-dark-accent)', borderRadius: '24px', color: '#fff', marginBottom: '24px' }}>
            <Shield size={28} />
          </div>
          <h2 className="font-serif" style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Create Account</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Get started with SignalEdge today limits.</p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ padding: '12px', background: 'rgba(255, 74, 74, 0.1)', borderRadius: '12px', color: 'var(--signal-bearish)', marginBottom: '24px', fontSize: '0.85rem', textAlign: 'center', fontWeight: 500 }}>
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
              Full Name
            </label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ width: '100%', padding: '16px 16px 16px 44px', background: '#ffffff', border: '1px solid var(--accent-border)', borderRadius: '16px', color: 'var(--text-primary)', outline: 'none', fontSize: '1rem', transition: 'border 0.2s', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}
                placeholder="Jane Doe"
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: '100%', padding: '16px 16px 16px 44px', background: '#ffffff', border: '1px solid var(--accent-border)', borderRadius: '16px', color: 'var(--text-primary)', outline: 'none', fontSize: '1rem', transition: 'border 0.2s', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: '100%', padding: '16px 16px 16px 44px', background: '#ffffff', border: '1px solid var(--accent-border)', borderRadius: '16px', color: 'var(--text-primary)', outline: 'none', fontSize: '1rem', transition: 'border 0.2s', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}
                placeholder="••••••••"
              />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>Must be at least 8 characters long.</div>
          </div>

          <button type="submit" className="btn-pill btn-pill-dark" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: '12px', padding: '18px', fontSize: '1rem' }}>
            {loading ? <Loader2 size={20} className="spin" /> : <>Complete Signup <ArrowRight size={18} /></>}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '32px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Already registered? <Link to="/login" style={{ color: 'var(--bg-dark)', fontWeight: 600, borderBottom: '1px solid var(--text-muted)', paddingBottom: '2px' }}>Sign in</Link>
        </p>
      </motion.div>
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
