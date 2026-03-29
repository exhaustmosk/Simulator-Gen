import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useScrollObserver } from '../hooks/useScrollObserver'
import {
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  Brain,
  History,
  Newspaper,
  ExternalLink,
  RefreshCw,
  BarChart3,
} from 'lucide-react'
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from 'recharts'

const API_BASE = 'http://localhost:8000'

const DEFAULT_TICKERS = ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'GOOGL', 'AMZN', 'META', 'AMD', 'NFLX', 'JPM']

interface Signal {
  type: string
  value: number
  direction: string
  strength: string
}

interface Insight {
  summary: string
  action: string
  confidence: number
  reasoning: string
  risk_factors: string
  time_horizon: string
}

interface TickerData {
  ticker: string
  price: number
  rsi: number | null
  macd: number | null
  volume_ratio: number | null
  overall_bias: string
  signals: Signal[]
  chart_data: ChartPoint[]
  insight: Insight
  backtest: Record<string, { win_rate: number | null; avg_return: number | null; sample_size: number }>
  news: { title: string; link: string; publisher: string }[]
}

interface ChartPoint {
  date: string
  close: number
  open: number
  high: number
  low: number
  volume: number
  rsi?: number
  ema20?: number
  ema50?: number
  bbUpper?: number
  bbLower?: number
}

interface WatchlistItem {
  ticker: string
  price: number
  overall_bias: string
  signals: Signal[]
  insight: Insight
  backtest: { win_rate: number | null; avg_return: number | null; sample_size: number } | null
}

export default function Dashboard() {
  useScrollObserver();
  const { symbol } = useParams<{ symbol: string }>()
  const navigate = useNavigate()
  const [selectedTicker, setSelectedTicker] = useState(symbol?.toUpperCase() || 'AAPL')
  const [tickerData, setTickerData] = useState<TickerData | null>(null)
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [watchlistLoading, setWatchlistLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [period, setPeriod] = useState('3mo')
  const [error, setError] = useState<string | null>(null)

  // Fetch single ticker detail
  const fetchTickerData = useCallback(async (ticker: string, p: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/api/ticker/${ticker}?period=${p}&interval=1d`)
      if (!res.ok) throw new Error(`Failed to fetch ${ticker}`)
      const data = await res.json()
      setTickerData(data)
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Failed to load data')
      setTickerData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch watchlist signals
  const fetchWatchlist = useCallback(async () => {
    setWatchlistLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/signals`)
      if (!res.ok) throw new Error('Failed to fetch signals')
      const data = await res.json()
      setWatchlist(data.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setWatchlistLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTickerData(selectedTicker, period)
  }, [selectedTicker, period, fetchTickerData])

  useEffect(() => {
    fetchWatchlist()
  }, [fetchWatchlist])

  const handleTickerSelect = (ticker: string) => {
    setSelectedTicker(ticker)
    navigate(`/dashboard/${ticker}`, { replace: true })
  }

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      handleTickerSelect(searchQuery.trim().toUpperCase())
      setSearchQuery('')
    }
  }

  const filteredTickers = DEFAULT_TICKERS.filter((t) =>
    t.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', minHeight: '100vh', background: 'var(--bg-primary)', alignItems: 'start' }}>
      {/* ===== SIDEBAR ===== */}
      <aside style={{ position: 'sticky', top: 0, height: '100vh', overflowY: 'auto', borderRight: '1px solid rgba(0,0,0,0.05)', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '32px', background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(20px)' }}>
        
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search ticker..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            style={{ width: '100%', padding: '12px 16px 12px 40px', background: '#fff', border: '1px solid var(--accent-border)', borderRadius: '24px', outline: 'none', fontSize: '0.9rem', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}
          />
        </div>

        {/* Watchlist */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, color: 'var(--text-muted)' }}>Watchlist</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {filteredTickers.map((ticker) => {
              const wItem = watchlist.find((w) => w.ticker === ticker)
              const isActive = selectedTicker === ticker
              return (
                <li
                  key={ticker}
                  onClick={() => handleTickerSelect(ticker)}
                  style={{
                    display: 'flex', justifyContent: 'space-between', padding: '10px 16px', borderRadius: '16px', cursor: 'pointer',
                    background: isActive ? 'var(--bg-dark)' : 'transparent',
                    color: isActive ? '#fff' : 'var(--text-primary)',
                    fontWeight: isActive ? 600 : 500,
                    transition: 'all 0.2s',
                    fontSize: '0.9rem'
                  }}
                  className="hover:bg-gray-100"
                >
                  <span style={{ fontFamily: 'var(--font-mono)' }}>{ticker}</span>
                  <span style={{ opacity: isActive ? 1 : 0.6 }}>
                    {wItem ? `$${wItem.price.toFixed(2)}` : '...'}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: 'auto' }}>
          <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, color: 'var(--text-muted)' }}>Quick Stats</h4>
          {!watchlistLoading && watchlist.length > 0 && (
            <div className="glass-box" style={{ padding: '16px', borderRadius: '20px', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Bullish Scans</span>
                <span style={{ color: 'var(--signal-bullish)', fontWeight: 600 }}>{watchlist.filter((w) => w.overall_bias === 'BULLISH').length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Bearish Scans</span>
                <span style={{ color: 'var(--signal-bearish)', fontWeight: 600 }}>{watchlist.filter((w) => w.overall_bias === 'BEARISH').length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--accent-border)' }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Total Signals Tracked</span>
                <span style={{ fontWeight: 700 }}>{watchlist.reduce((sum, w) => sum + w.signals.length, 0)}</span>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main style={{ padding: '40px 5vw', position: 'relative' }}>
        
        {/* Subtle decorative glow in the background of the main canvas */}
        <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '40vw', height: '40vw', background: 'var(--bg-purple)', filter: 'blur(120px)', opacity: 0.2, borderRadius: '50%', zIndex: 0, pointerEvents: 'none' }} />

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', flexDirection: 'column', gap: '16px', color: 'var(--text-muted)', zIndex: 10, position: 'relative' }}>
            <RefreshCw size={32} className="spin" />
            <span>Analyzing {selectedTicker}...</span>
          </div>
        ) : error ? (
          <div style={{ padding: '32px', background: 'rgba(255, 74, 74, 0.1)', color: 'var(--signal-bearish)', borderRadius: '24px', textAlign: 'center', zIndex: 10, position: 'relative' }}>
            <p style={{ fontWeight: 600, marginBottom: '16px' }}>{error}</p>
            <button className="btn-pill btn-pill-outline" onClick={() => fetchTickerData(selectedTicker, period)}>Retry Fetch</button>
          </div>
        ) : tickerData ? (
          <div style={{ zIndex: 10, position: 'relative', display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1200px', margin: '0 auto' }}>
            
            {/* Header */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid var(--accent-border)', paddingBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <h1 className="font-serif" style={{ fontSize: '3.5rem', margin: 0, lineHeight: 1 }}>{tickerData.ticker}</h1>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>${tickerData.price.toFixed(2)}</span>
                  <BiasTag bias={tickerData.overall_bias} />
                </div>
              </div>
              <button className="btn-pill btn-pill-outline" onClick={() => fetchTickerData(selectedTicker, period)} style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
                <RefreshCw size={14} /> Refresh Data
              </button>
            </header>

            {/* Indicator Pills Row */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              {[
                { label: 'RSI', val: tickerData.rsi ?? 'N/A' },
                { label: 'MACD', val: tickerData.macd ?? 'N/A' },
                { label: 'Vol Ratio', val: `${tickerData.volume_ratio ?? 'N/A'}x` },
                { label: 'Signals', val: tickerData.signals.length }
              ].map((pill, i) => (
                <div key={i} className="glass-box" style={{ padding: '12px 24px', borderRadius: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, color: 'var(--text-muted)' }}>{pill.label}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{pill.val}</span>
                </div>
              ))}
            </div>

            {/* Main Grid: Chart + AI Insight */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 5fr) minmax(0, 3fr)', gap: '24px' }}>
              
              {/* Chart Panel */}
              <div className="glass-box" style={{ borderRadius: '32px', padding: '0', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '24px 32px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}><BarChart3 size={18} color="var(--accent-purple)"/> Technical Chart</h3>
                  <div style={{ display: 'flex', background: '#fff', borderRadius: '24px', padding: '4px', border: '1px solid var(--accent-border)' }}>
                    {['1mo', '3mo', '6mo', '1y'].map((p) => (
                      <button
                        key={p}
                        style={{ padding: '6px 16px', borderRadius: '20px', border: 'none', background: period === p ? 'var(--bg-dark)' : 'transparent', color: period === p ? '#fff' : 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                        onClick={() => setPeriod(p)}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ padding: '24px', flex: 1, minHeight: '350px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={tickerData.chart_data}>
                      <defs>
                        <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--accent-purple)" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="var(--accent-purple)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fontFamily: 'var(--font-mono)', fill: '#aaa' }} tickLine={false} axisLine={false} tickFormatter={(v) => { const d = new Date(v); return `${d.getMonth() + 1}/${d.getDate()}` }} />
                      <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fontFamily: 'var(--font-mono)', fill: '#aaa' }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                      <Tooltip
                        contentStyle={{ background: '#fff', border: '1px solid var(--accent-border)', borderRadius: '16px', padding: '16px', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}
                        formatter={(value: any, name: any) => [`$${typeof value === 'number' ? value.toFixed(2) : value}`, String(name).charAt(0).toUpperCase() + String(name).slice(1)]}
                      />
                      <Area type="monotone" dataKey="close" stroke="var(--accent-purple)" strokeWidth={3} fill="url(#colorClose)" dot={false} name="close" />
                      {tickerData.chart_data.some((d) => d.ema20) && <Line type="monotone" dataKey="ema20" stroke="#c4a7ff" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />}
                      {tickerData.chart_data.some((d) => d.bbUpper) && <Line type="monotone" dataKey="bbUpper" stroke="#90a4ae" strokeWidth={1} dot={false} strokeDasharray="2 2" />}
                      {tickerData.chart_data.some((d) => d.bbLower) && <Line type="monotone" dataKey="bbLower" stroke="#90a4ae" strokeWidth={1} dot={false} strokeDasharray="2 2" />}
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* AI Insight Panel */}
              <div className="dark-panel" style={{ padding: '32px', borderRadius: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--accent-purple)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700 }}>
                  <Brain size={18} /> Grog Intelligence Desk
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                  <div style={{ background: tickerData.insight.action === 'BUY' ? 'rgba(0, 219, 117, 0.15)' : tickerData.insight.action === 'SELL' ? 'rgba(255, 74, 74, 0.15)' : 'rgba(255, 255, 255, 0.1)', color: tickerData.insight.action === 'BUY' ? 'var(--signal-bullish)' : tickerData.insight.action === 'SELL' ? 'var(--signal-bearish)' : '#fff', padding: '12px 24px', borderRadius: '24px', fontSize: '1.2rem', fontWeight: 800, border: `1px solid ${tickerData.insight.action === 'BUY' ? 'rgba(0, 219, 117, 0.3)' : tickerData.insight.action === 'SELL' ? 'rgba(255, 74, 74, 0.3)' : 'rgba(255, 255, 255, 0.2)'}` }}>
                    {tickerData.insight.action || 'HOLD'}
                  </div>
                  <ConfidenceRing value={tickerData.insight.confidence || 0} />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-on-dark-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Time Horizon</span>
                    <span style={{ fontSize: '1rem', color: '#fff', fontWeight: 600 }}>{tickerData.insight.time_horizon?.replace('_', ' ') || 'N/A'}</span>
                  </div>
                </div>

                <div style={{ color: '#fff', fontSize: '1.2rem', lineHeight: 1.5, fontFamily: 'var(--font-serif)' }}>
                  "{tickerData.insight.summary}"
                </div>

                <p style={{ color: 'var(--text-on-dark-muted)', lineHeight: 1.6, fontSize: '0.95rem' }}>
                  {tickerData.insight.reasoning}
                </p>

                <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)' }} />

                <div style={{ color: 'var(--text-on-dark-muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                  <strong style={{ color: 'var(--signal-bearish)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>⚠ Risk Factors</strong>
                  {tickerData.insight.risk_factors}
                </div>
                
                {tickerData.backtest && Object.keys(tickerData.backtest).length > 0 && (
                  <>
                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                    <div style={{ fontSize: '0.85rem' }}>
                      <div style={{ color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <History size={16} color="var(--text-on-dark-muted)" /> Backtest Confidence
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {Object.entries(tickerData.backtest).map(([sigType, bt]) => (
                          bt.sample_size > 0 && (
                            <div key={sigType} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '8px 16px', borderRadius: '12px', color: 'var(--text-on-dark-muted)' }}>
                              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{sigType.replace(/_/g, ' ')}</span>
                              <div style={{ display: 'flex', gap: '16px', color: '#fff', fontWeight: 600 }}>
                                <span style={{ color: (bt.win_rate ?? 0) >= 50 ? 'var(--signal-bullish)' : 'var(--signal-bearish)' }}>{bt.win_rate}% win</span>
                                <span>{bt.avg_return}% avg</span>
                              </div>
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Signal & News Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: tickerData.news?.length ? '1fr 1fr' : '1fr', gap: '24px' }}>
              
              {tickerData.signals.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '8px' }}>
                    <TrendingUp size={18} color="var(--accent-purple)"/> Technical Signals Firing
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {tickerData.signals.map((sig, idx) => (
                      <div key={idx} className="glass-box" style={{ padding: '20px 24px', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, color: sig.strength === 'STRONG' ? 'var(--accent-purple)' : 'var(--text-muted)' }}>{sig.strength}</span>
                          <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{sig.type.replace(/_/g, ' ')}</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700, color: sig.direction === 'BULLISH' ? 'var(--signal-bullish)' : sig.direction === 'BEARISH' ? 'var(--signal-bearish)' : 'var(--text-muted)' }}>
                            {sig.direction === 'BULLISH' ? <TrendingUp size={16} /> : sig.direction === 'BEARISH' ? <TrendingDown size={16} /> : <Minus size={16} />}
                            {sig.direction}
                          </div>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Trigger: {sig.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tickerData.news && tickerData.news.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '8px' }}>
                    <Newspaper size={18} color="var(--accent-purple)"/> Institutional News Flow
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {tickerData.news.map((item, idx) => (
                      <a key={idx} href={item.link} target="_blank" rel="noopener noreferrer" className="glass-box" style={{ padding: '24px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '12px', textDecoration: 'none', transition: 'transform 0.2s', cursor: 'pointer' }}>
                         <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-purple)', textTransform: 'uppercase', letterSpacing: '1px' }}>{item.publisher}</div>
                         <h4 style={{ fontSize: '1.05rem', lineHeight: 1.4, margin: 0, color: 'var(--text-primary)', fontWeight: 600 }}>{item.title} <ExternalLink size={14} style={{ marginLeft: '4px', verticalAlign: 'baseline', opacity: 0.5 }} /></h4>
                      </a>
                    ))}
                  </div>
                </div>
              )}

            </div>
            
          </div>
        ) : null}
      </main>
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

/* ===== Sub-components ===== */

function BiasTag({ bias }: { bias: string }) {
  const isBull = bias === 'BULLISH'
  const isBear = bias === 'BEARISH'
  const color = isBull ? 'var(--signal-bullish)' : isBear ? 'var(--signal-bearish)' : 'var(--text-muted)'
  const bg = isBull ? 'rgba(0, 219, 117, 0.1)' : isBear ? 'rgba(255, 74, 74, 0.1)' : 'rgba(0,0,0,0.05)'
  const Icon = isBull ? TrendingUp : isBear ? TrendingDown : Minus
  
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: bg, color: color, padding: '6px 16px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.5px' }}>
      <Icon size={14} />
      {bias}
    </span>
  )
}

function ConfidenceRing({ value }: { value: number }) {
  const radius = 22
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference
  const color = value >= 70 ? 'var(--signal-bullish)' : value >= 40 ? '#FFB800' : 'var(--signal-bearish)'

  return (
    <div style={{ position: 'relative', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="56" height="56" viewBox="0 0 56 56" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="28" cy="28" r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
        <circle
          cx="28" cy="28" r={radius} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
        />
      </svg>
      <span style={{ position: 'absolute', fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>{value}%</span>
    </div>
  )
}
