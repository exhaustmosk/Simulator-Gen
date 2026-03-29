import { useScrollObserver } from '../hooks/useScrollObserver'
import { Rocket, Cpu, LineChart, Code2 } from 'lucide-react'

export default function About() {
  useScrollObserver()

  return (
    <div style={{ padding: 'var(--space-4xl) 0' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-4xl)' }} className="animate-on-scroll fade-up">
          <div className="hero-badge" style={{ marginBottom: 'var(--space-sm)' }}>
            <Rocket size={14} /> Our Mission
          </div>
          <h1 style={{ marginBottom: 'var(--space-md)' }}>Democratizing AI-Powered Financial Intelligence.</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '640px', margin: '0 auto', lineHeight: '1.8' }}>
            Built for this hackathon, our platform bridges the gap between institutional-grade trading algorithms and retail investors using state-of-the-art AI model reasoning.
          </p>
        </div>

        <div className="use-cases-grid" style={{ marginBottom: 'var(--space-4xl)' }}>
          <div className="glass-card animate-on-scroll stagger-1">
            <div style={{ display: 'inline-flex', padding: '12px', background: 'var(--accent-green-light)', borderRadius: 'var(--radius-md)', color: 'var(--accent-green)', marginBottom: 'var(--space-md)' }}>
              <Cpu size={24} />
            </div>
            <h3 style={{ marginBottom: 'var(--space-sm)' }}>The Agentic AI Engine</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              We don't just use standard language models. We built a customized data-ingestion pipeline that feeds raw financial data, technical indicators, and news sentiment right into our AI reasoning agent.
            </p>
          </div>

          <div className="glass-card animate-on-scroll stagger-2">
            <div style={{ display: 'inline-flex', padding: '12px', background: 'var(--accent-purple-light)', borderRadius: 'var(--radius-md)', color: 'var(--accent-purple)', marginBottom: 'var(--space-md)' }}>
              <LineChart size={24} />
            </div>
            <h3 style={{ marginBottom: 'var(--space-sm)' }}>Real-Time Computation</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Instead of relying on delayed datasets, we recalculate live RSI, MACD, and Bollinger Bands on the fly to detect breakouts and momentum shifts before the market fully digests them.
            </p>
          </div>
        </div>

        <div className="glass-card animate-on-scroll fade-up" style={{ padding: 'var(--space-2xl)', textAlign: 'center' }}>
          <h2 style={{ marginBottom: 'var(--space-lg)' }}>Tech Stack</h2>
          <div style={{ display: 'flex', gap: 'var(--space-xl)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <StackBadge icon={<Code2 size={16} />} text="React 19 + Vite" />
            <StackBadge icon={<Code2 size={16} />} text="FastAPI + Uvicorn" />
            <StackBadge icon={<Code2 size={16} />} text="Pandas + TA-Lib" />
            <StackBadge icon={<Code2 size={16} />} text="Recharts UI" />
            <StackBadge icon={<Code2 size={16} />} text="Custom CSS Glassmorphism" />
          </div>
        </div>
      </div>
    </div>
  )
}

function StackBadge({ icon, text }: { icon: React.ReactNode, text: string }) {
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '8px', 
      background: 'rgba(255,255,255,0.05)', 
      border: '1px solid var(--border-color)', 
      padding: '8px 16px', 
      borderRadius: 'var(--radius-full)',
      fontSize: '0.9rem',
      fontWeight: 500,
      color: 'var(--text-on-dark-muted)'
    }}>
      {icon} {text}
    </div>
  )
}
