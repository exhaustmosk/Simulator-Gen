import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Activity, ChevronDown, Fingerprint } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const NavItem = ({ title, activeHover, setActiveHover, children }: any) => {
  const isHovered = activeHover === title
  return (
    <div 
      className="nav-item" 
      style={{ position: 'relative', display: 'flex', gap: '4px', alignItems: 'center', cursor: 'pointer', padding: '16px 0' }}
      onMouseEnter={() => setActiveHover(title)}
      onMouseLeave={() => setActiveHover(null)}
    >
      {title} {children && <ChevronDown size={14} style={{ transform: isHovered ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />}
      
      <AnimatePresence>
        {isHovered && children && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid var(--accent-border)',
              borderRadius: 'var(--radius-md)',
              padding: '8px',
              minWidth: '220px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              zIndex: 1000
            }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const DropdownLink = ({ title, desc, targetId }: { title: string, desc: string, targetId: string }) => {
  const navigate = useNavigate()
  const location = useLocation()

  const handleScroll = (e: React.MouseEvent) => {
    e.preventDefault()
    if (location.pathname !== '/') {
      navigate('/')
      setTimeout(() => {
        document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } else {
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <a href={`#${targetId}`} onClick={handleScroll} style={{ padding: '12px', borderRadius: 'var(--radius-sm)', transition: 'background 0.2s', display: 'flex', flexDirection: 'column', gap: '4px', textDecoration: 'none' }} className="hover:bg-gray-50 dropdown-link">
      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{title}</div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{desc}</div>
    </a>
  )
}

export default function Navbar() {
  const [activeHover, setActiveHover] = useState<string | null>(null)
  
  return (
    <div className="floating-nav-wrapper">
      <motion.nav 
        className="floating-nav"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.1 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '1.2rem', paddingRight: '16px', borderRight: '1px solid var(--accent-border)', cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth'})}>
          <Activity size={24} color="var(--accent-green)" />
          SignalEdge
        </div>

        {/* Updated Navbar Dropdowns to scroll programmaticially */}
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center', fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
          <NavItem title="Product" activeHover={activeHover} setActiveHover={setActiveHover}>
            <DropdownLink title="Signal Engine" desc="Multi-timeframe technical scanning" targetId="demo" />
            <DropdownLink title="Groq Intelligence" desc="Natural language market inference by LPU" targetId="pipeline" />
            <DropdownLink title="Capabilities" desc="View all mathematical triggers supported" targetId="capabilities" />
          </NavItem>
          
          <NavItem title="Company" activeHover={activeHover} setActiveHover={setActiveHover}>
            <DropdownLink title="FAQ" desc="Common questions regarding latency" targetId="faq" />
            <DropdownLink title="Live News" desc="Real-time institutional context scraper" targetId="news" />
          </NavItem>

          <NavItem title="Business" activeHover={activeHover} setActiveHover={setActiveHover} />
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginLeft: 'auto', borderLeft: '1px solid var(--accent-border)', paddingLeft: '16px' }}>
          <Link to="/login" className="btn-pill btn-pill-outline">
            Launch Web App
          </Link>
          <Link to="/signup" className="btn-pill btn-pill-purple">
            <Fingerprint size={16} /> Sign Up Free
          </Link>
        </div>
      </motion.nav>
      <style>{`
        .dropdown-link:hover { background: var(--bg-primary); }
      `}</style>
    </div>
  )
}
