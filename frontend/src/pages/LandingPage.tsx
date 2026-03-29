import React, { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { Fingerprint, CheckCircle2, ChevronRight, Activity, Cpu, Target, Network, Loader2, Search, ArrowRight, ChevronDown } from 'lucide-react'

// Internal component for smooth text reveal on scroll
function TextReveal({ text, splitBy = "word", isSerif = false }: { text: string, splitBy?: string, isSerif?: boolean }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 90%", "end center"] })
  const fragments = splitBy === "word" ? text.split(" ") : text.split("")

  return (
    <span ref={ref} style={{ display: 'inline-flex', flexWrap: 'wrap', gap: splitBy === 'word' ? '0.3em' : '0', position: 'relative' }} className={isSerif ? 'font-serif' : ''}>
      {fragments.map((frag, i) => {
        const start = i / fragments.length
        const end = start + (1 / fragments.length)
        const opacity = useTransform(scrollYProgress, [start, end], [0.1, 1])
        return (
          <motion.span key={i} style={{ opacity, display: 'inline-block' }}>
            {frag}{splitBy === 'word' ? "" : ""}
          </motion.span>
        )
      })}
    </span>
  )
}

function LiveDemoCard() {
  const [ticker, setTicker] = useState('PLTR')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    handleScan()
  }, [])

  const handleScan = async () => {
    if (!ticker) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`http://localhost:8000/api/ticker/${ticker.toUpperCase()}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.detail || 'Failed to scan ticker')
      setData(json)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }} viewport={{ once: true, margin: "-100px" }}
      className="hero-visual-card"
    >
      <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)' }}>
        <div style={{ position: 'relative', width: '250px' }}>
          <Search size={16} color="var(--text-on-dark-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Scan any ticker (e.g., TSLA)" 
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleScan()}
            style={{ width: '100%', padding: '12px 16px 12px 40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
          />
        </div>
        <button onClick={handleScan} className="btn-pill btn-pill-purple" style={{ padding: '8px 24px', fontSize: '0.85rem' }} disabled={loading}>
          {loading ? <Loader2 size={16} className="spin" /> : 'Run Analysis'}
        </button>
      </div>
      
      <div style={{ padding: '48px 64px', display: 'flex', flexDirection: 'column', gap: '24px', minHeight: '300px' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px', color: 'var(--text-on-dark-muted)' }}>
            <Loader2 size={32} className="spin" />
            <span>Intercepting market data for {ticker.toUpperCase()}...</span>
          </div>
        ) : error ? (
          <div style={{ color: 'var(--signal-bearish)', textAlign: 'center', padding: '40px' }}>{error}</div>
        ) : data ? (
          <>
            <motion.h3 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={{ fontSize: '2rem', color: '#fff', fontFamily: 'var(--font-serif)', fontWeight: 400, letterSpacing: '0.01em', display: 'flex', alignItems: 'center', gap: '16px' }}>
              Deep scan results on <span style={{ color: data.overall_bias === 'bullish' ? 'var(--signal-bullish)' : data.overall_bias === 'bearish' ? 'var(--signal-bearish)' : 'var(--text-on-dark-muted)' }}>{data.ticker}</span>
              <span style={{ fontSize: '1.2rem', fontFamily: 'var(--font-sans)', color: 'var(--text-on-dark-muted)' }}>${data.price?.toFixed(2)}</span>
            </motion.h3>
            
            <div style={{ display: 'flex', gap: '24px', flexDirection: 'column' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '24px', padding: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ color: 'var(--text-on-dark-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px' }}>AI Insights</div>
                <p style={{ color: '#fff', fontSize: '1.05rem', lineHeight: 1.6 }}>
                  "{data.insight?.reasoning || data.insight?.summary || "Analysis complete. Waiting for specific signal triggers."}"
                </p>
                <div style={{ marginTop: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  {data.signals?.length > 0 ? data.signals.map((s: any, i: number) => (
                    <div key={i} style={{ background: s.direction === 'bullish' ? 'rgba(0, 219, 117, 0.1)' : 'rgba(255, 74, 74, 0.1)', color: s.direction === 'bullish' ? 'var(--signal-bullish)' : 'var(--signal-bearish)', padding: '8px 16px', borderRadius: '16px', fontSize: '0.8rem', fontWeight: 600 }}>
                      {s.type.replace('_', ' ')}
                    </div>
                  )) : (
                    <div style={{ background: 'rgba(255, 255, 255, 0.05)', color: '#fff', padding: '8px 16px', borderRadius: '16px', fontSize: '0.8rem' }}>NO ACTIVE SIGNALS</div>
                  )}
                  {data.signals?.length > 0 && <div style={{ background: 'rgba(255, 255, 255, 0.05)', color: '#fff', padding: '8px 16px', borderRadius: '16px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}><Activity size={14} /> LIVE INDICATORS READY</div>}
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </motion.div>
  )
}

function LiveNewsSection() {
  const [news, setNews] = useState<any[]>([])
  
  useEffect(() => {
    fetch('http://localhost:8000/api/news/SPY')
      .then(res => res.json())
      .then(data => {
        if(data.news) setNews(data.news.slice(0, 3))
      })
      .catch(console.error)
  }, [])

  if (news.length === 0) return null

  return (
    <section id="news" className="container" style={{ padding: '10vh 0', zIndex: 10, position: 'relative' }}>
        <h2 className="text-h2 font-serif" style={{ marginBottom: '48px' }}>Real-time Market Context</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {news.map((item, i) => (
            <a key={i} href={item.link} target="_blank" rel="noreferrer" className="glass-box" style={{ padding: '32px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '16px', transition: 'transform 0.2s' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-purple)', textTransform: 'uppercase', letterSpacing: '1px' }}>{item.publisher}</div>
              <h4 style={{ fontSize: '1.2rem', lineHeight: 1.4, fontFamily: 'var(--font-sans)', fontWeight: 600 }}>{item.title}</h4>
              <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Read article <ArrowRight size={14} /></div>
            </a>
          ))}
        </div>
    </section>
  )
}

function FaqAccordion() {
  const faqs = [
    { q: "Is SignalEdge trading my capital?", a: "No. SignalEdge is an intelligence layer, not a broker. It processes millions of data points to generate actionable insights, but execution remains strictly in your control via your preferred brokerage." },
    { q: "How does the Groq inference engine work?", a: "We feed raw numeric technical arrays (RSI, moving average slopes, volume ratios) and breaking news strings directly into Groq's LPU-powered Llama 3 models in real-time. This eliminates processing latency, giving you instantaneous human-readable analysis." },
    { q: "Can I backtest custom strategies?", a: "Yes. The Pro tier allows you to connect custom indicator bundles and verify them against our historical price database to determine empirical win rates." }
  ]
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="faq" className="container" style={{ padding: '10vh 0', zIndex: 10, position: 'relative' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h2 className="text-h2 font-serif" style={{ marginBottom: '48px', textAlign: 'center' }}>Frequently Asked Questions</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i
            return (
              <div key={i} className="glass-box" style={{ padding: '24px 32px', borderRadius: '24px', cursor: 'pointer', border: isOpen ? '1px solid var(--accent-purple)' : '1px solid var(--accent-border)' }} onClick={() => setOpenIndex(isOpen ? null : i)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>{faq.q}</h4>
                  <ChevronDown size={20} style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s', color: 'var(--accent-purple)' }} />
                </div>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1, marginTop: '16px' }} exit={{ height: 0, opacity: 0, marginTop: 0 }} style={{ overflow: 'hidden' }}>
                      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function InferencePipeline() {
  return (
    <section id="pipeline" className="container" style={{ padding: '15vh 0', zIndex: 10, position: 'relative' }}>
      <div style={{ textAlign: 'center', marginBottom: '64px' }}>
        <h2 className="text-h2 font-serif" style={{ marginBottom: '16px' }}>The Inference Pipeline</h2>
        <p className="text-sub" style={{ margin: '0 auto' }}>How raw market data becomes a deterministic trading edge in milliseconds.</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', alignItems: 'center' }}>
        <div className="glass-box text-center" style={{ padding: '40px 24px', borderRadius: '32px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <Activity size={24} color="var(--text-primary)" />
          </div>
          <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>Ingestion Layer</h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>OHLCV arrays and news API feeds are normalized continuously.</p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--accent-purple)' }}>
          <ArrowRight size={32} />
        </div>
        <div className="dark-panel text-center" style={{ padding: '40px 24px', borderRadius: '32px', background: 'var(--bg-dark)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--accent-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <Cpu size={24} color="var(--bg-dark)" />
          </div>
          <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px', color: '#fff' }}>Groq NLP Analysis</h4>
          <p style={{ color: 'var(--text-on-dark-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>Mathematical indicators are translated into high-probability conclusions.</p>
        </div>
      </div>
    </section>
  )
}

export default function LandingPage() {
  const containerRef = useRef(null)
  const { scrollY } = useScroll()
  const ringRotate = useTransform(scrollY, [0, 2000], [0, 360])
  const heroY = useTransform(scrollY, [0, 500], [0, 100])

  return (
    <div ref={containerRef} style={{ background: 'var(--bg-primary)', position: 'relative', overflowX: 'hidden' }}>
      
      {/* Decorative Continuous Background Elements Globally Fixed */}
      <motion.div style={{ position: 'fixed', top: '50%', left: '50%', x: '-50%', y: '-50%', rotate: ringRotate, opacity: 0.08, pointerEvents: 'none', zIndex: 0 }}>
        <svg viewBox="0 0 1000 1000" width="120vw" height="120vw" style={{ minWidth: "1000px" }}>
          <path id="curve" fill="transparent" d="M 500, 500 m -400, 0 a 400,400 0 1,1 800,0 a 400,400 0 1,1 -800,0" />
          <text width="1000">
            <textPath href="#curve" startOffset="0" style={{ fontSize: '24px', fontFamily: 'var(--font-sans)', letterSpacing: '8px', fill: 'var(--text-primary)' }}>
              DETECT SIGNALS · ANALYZE SENTIMENT · AUTOMATE MARKETS · REVEAL PATTERNS · BACKTEST STRATEGIES · 
            </textPath>
            <textPath href="#curve" startOffset="50%" style={{ fontSize: '24px', fontFamily: 'var(--font-sans)', letterSpacing: '8px', fill: 'var(--text-primary)' }}>
              DETECT SIGNALS · ANALYZE SENTIMENT · AUTOMATE MARKETS · REVEAL PATTERNS · BACKTEST STRATEGIES · 
            </textPath>
          </text>
        </svg>
      </motion.div>

      {/* Floating accent orb */}
      <div style={{ position: 'fixed', top: '30vh', right: '-10vw', width: '40vw', height: '40vw', borderRadius: '50%', background: 'var(--bg-purple)', filter: 'blur(120px)', opacity: 0.6, zIndex: 0, pointerEvents: 'none', animation: 'pulse-dot 8s infinite alternate' }} />

      {/* ===== HERO Section ===== */}
      <section className="container" style={{ paddingTop: '22vh', paddingBottom: '10vh', position: 'relative', zIndex: 10 }}>
        <motion.div style={{ y: heroY, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', maxWidth: '1000px', margin: '0 auto' }}>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '1.5rem', letterSpacing: '0.04em' }}>
            NOW LIVE FOR RETAIL INVESTORS
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-huge"
            style={{ marginBottom: '2rem' }}
          >
            Don't guess, <span className="font-serif italic" style={{ display: 'inline-block', position: 'relative' }}>
              just analyze
              <svg style={{ position: 'absolute', bottom: '-15px', left: 0, width: '100%', height: '20px' }} preserveAspectRatio="none" viewBox="0 0 100 20" xmlns="http://www.w3.org/2000/svg">
                <motion.path 
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 0.8, ease: 'easeOut' }}
                  d="M0,10 C30,15 70,5 100,10" stroke="var(--accent-purple)" strokeWidth="6" fill="none" strokeLinecap="round" />
              </svg>
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="text-sub" style={{ maxWidth: '600px', margin: '0 auto 3rem' }}
          >
            The market intelligence AI that turns momentum shifts, technical breakouts, and raw data into clear, institutional-grade insights.
          </motion.p>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.4 }} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <Link to="/signup" className="btn-pill btn-pill-purple" style={{ padding: '16px 32px', fontSize: '1.1rem' }}>
              <Fingerprint size={20} /> Launch Free
            </Link>
            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>Available on Web,</span>
              <span>Desktop, and Mobile</span>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ===== HERO VISUAL DEMO (LIVE FUNCTIONAL) ===== */}
      <section id="demo" className="container" style={{ paddingBottom: '10vh', position: 'relative', zIndex: 10 }}>
        <LiveDemoCard />
      </section>

      {/* ===== NEW FUNCTIONAL SECTION: LIVE NEWS ===== */}
      <LiveNewsSection />

      {/* ===== LOGO GARDEN (GREEN ACCENT) ===== */}
      <section className="green-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', zIndex: 10 }}>
        <h3 className="font-serif" style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '32px' }}>
          Tested against institutional datasets to speed up your thesis
        </h3>
        <div className="ticker-banner" style={{ width: '100%', background: 'transparent' }}>
          <div className="ticker-track" style={{ animation: 'scrollTrack 30s linear infinite' }}>
            {/* Logos represented as bold clean text for now */}
            {[1, 2].map(k => (
              <React.Fragment key={k}>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, opacity: 0.7 }}>NASDAQ</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 600, opacity: 0.7 }}>NYSE</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 700, opacity: 0.7, fontFamily: 'var(--font-serif)' }}>YahooFinance</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, opacity: 0.7, letterSpacing: '-1px' }}>grok</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 600, opacity: 0.7 }}>S&P500</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, opacity: 0.7 }}>DowJones</span>
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 4X FASTER SECTION ===== */}
      <section id="signal-engine" className="container" style={{ padding: '15vh 0', zIndex: 10, position: 'relative' }}>
        <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 64px' }}>
          <h2 className="text-h2" style={{ marginBottom: '24px' }}>
            <span className="font-sans font-bold" style={{ fontWeight: 700 }}>10x faster</span> <span className="font-serif">than manual screening</span>
          </h2>
          <p className="text-sub">
            <TextReveal text="After decades of scanning charts manually, intelligence that actually works is finally here. When you detect patterns faster, you free up time to optimize sizing and strategy." />
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '32px' }}>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-box" style={{ borderRadius: '32px', padding: '48px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
              <Fingerprint size={28} color="var(--text-muted)" />
            </div>
            <div style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Manual Screening</div>
            <div className="font-serif text-h2">1.5 hrs</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '8px' }}>per evening</div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="dark-panel" style={{ margin: 0, padding: '48px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'var(--bg-dark)' }}>
            <div style={{ fontSize: '1.1rem', color: 'var(--text-on-dark-muted)', marginBottom: '8px' }}>SignalEdge AI</div>
            <div className="font-serif" style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', color: '#fff', lineHeight: 1 }}>Real-time</div>
            <div style={{ fontSize: '1.1rem', color: 'var(--text-on-dark-muted)', marginTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '24px' }}>
              Continuous processing of indicators, news volatility, and historical performance arrays—instantly pushed to your dashboard.
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== NEW: INFERENCE PIPELINE ===== */}
      <InferencePipeline />

      {/* ===== CAPABILITIES ASYMMETRIC BENTO BOX ===== */}
      <section id="capabilities" style={{ padding: '5vh 0 15vh', position: 'relative', zIndex: 10 }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 className="text-h2 font-serif" style={{ marginBottom: '24px' }}>Personal intelligence desk</h2>
            <p className="text-sub" style={{ maxWidth: '500px', margin: '0 auto' }}>
              SignalEdge automatically learns the technical indicators you care about and generates probabilistic outcomes.
            </p>
          </div>

          <div className="bento-grid" style={{ 
            display: 'grid', 
            gap: '32px',
            padding: '24px'
          }}>
            {[
              { title: "RSI Divergence", icon: Activity, desc: "Auto-detect oversold bounces before standard screeners flag them.", rot: -2.5, yOff: 0 },
              { title: "Groq Reasoning", icon: Cpu, desc: "Deep multi-stage inference translating math into readable English.", rot: 3, yOff: 20 },
              { title: "Volume Anchoring", icon: Target, desc: "Identify institutional accumulation trails dynamically.", rot: -1.5, yOff: -15 },
              { title: "Portfolio Context", icon: Network, desc: "Analyze how a breakout correlates with your broader holdings.", rot: 2, yOff: 10 }
            ].map((f, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 40, rotate: 0 }} 
                whileInView={{ opacity: 1, y: f.yOff, rotate: f.rot }} 
                whileHover={{ rotate: 0, scale: 1.03, y: 0, boxShadow: '0 20px 60px rgba(0,0,0,0.12)' }}
                transition={{ duration: 0.7, delay: i * 0.15 }}
                viewport={{ once: true }}
                className="glass-box bento-card" 
                style={{ padding: '40px', borderRadius: '32px', cursor: 'pointer', display: 'flex', flexDirection: 'column', willChange: 'transform' }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                  <f.icon size={22} color="var(--bg-dark)" />
                </div>
                <h3 className="font-serif" style={{ fontSize: '1.8rem', marginBottom: '16px' }}>{f.title}</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5, flex: 1 }}>{f.desc}</p>
                <div style={{ marginTop: '32px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 600, color: 'var(--accent-purple)' }}>
                  Explore feature <ChevronRight size={16} />
                </div>
              </motion.div>
            ))}
          </div>
          <style>{`
             .bento-grid {
               grid-template-columns: 1fr;
             }
             @media (min-width: 900px) {
               .bento-grid {
                 grid-template-columns: repeat(3, 1fr);
                 grid-auto-rows: minmax(280px, auto);
               }
               .bento-card:nth-child(1) { grid-column: span 2; grid-row: span 2; }
               .bento-card:nth-child(2) { grid-column: span 1; grid-row: span 1; }
               .bento-card:nth-child(3) { grid-column: span 1; grid-row: span 2; }
               .bento-card:nth-child(4) { grid-column: span 2; grid-row: span 1; }
             }
          `}</style>
        </div>
      </section>

      {/* ===== NEW: FAQ Section ===== */}
      <FaqAccordion />

      {/* ===== BOTTOM CTA ===== */}
      <section className="dark-panel" style={{ textAlign: 'center', padding: '10vw 5vw', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
        <h2 className="text-h2 font-serif" style={{ color: '#fff', marginBottom: '32px', maxWidth: '800px' }}>
          Stop guessing. Start executing with algorithmic confidence today.
        </h2>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Link to="/signup" className="btn-pill btn-pill-purple" style={{ padding: '18px 40px', fontSize: '1.1rem' }}>
            Get Early Access
          </Link>
          <Link to="/login" className="btn-pill btn-pill-outline" style={{ border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '18px 40px', fontSize: '1.1rem' }}>
            Sign In
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '40px 5vw', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--accent-border)', fontSize: '0.85rem', color: 'var(--text-muted)', position: 'relative', zIndex: 10 }}>
        <div>© 2026 SignalEdge Technologies.</div>
        <div style={{ display: 'flex', gap: '24px' }}>
          <span>Privacy</span>
          <span>Terms</span>
          <span>Security</span>
        </div>
      </footer>
    </div>
  )
}
