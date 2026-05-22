import { useState } from 'react';

function formatTime(date) {
  if (!date) return null;
  return date.toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' });
}

export default function Header({ lastFetch, onRefresh, refreshing }) {
  const [spinning, setSpinning] = useState(false);

  const handleRefresh = () => {
    if (refreshing) return;
    setSpinning(true);
    onRefresh();
    setTimeout(() => setSpinning(false), 1200);
  };

  return (
    <header className="relative overflow-hidden noise" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-20 blur-3xl"
             style={{ background: 'radial-gradient(ellipse, #6366f1 0%, transparent 70%)' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">

          {/* Logo + title */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold"
                   style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 20px rgba(99,102,241,0.4)' }}>
                🗞
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight gradient-text leading-none">
                  TechPulse GR
                </h1>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>
                  Powered by TechCrunch + Claude AI
                </p>
              </div>
            </div>

            <p className="text-sm md:text-base max-w-xl leading-relaxed" style={{ color: 'var(--muted2)' }}>
              Τα <span className="font-semibold" style={{ color: 'var(--accent)' }}>20 πιο σημαντικά</span> tech &amp; business νέα,
              επιλεγμένα και αναλυμένα με AI — κάθε μέρα.
            </p>
          </div>

          {/* Right: last update + refresh */}
          <div className="flex items-center gap-3">
            {lastFetch && (
              <p className="text-xs" style={{ color: 'var(--muted)' }}>
                Τελευταία ενημέρωση: <span style={{ color: 'var(--muted2)' }}>{formatTime(lastFetch)}</span>
              </p>
            )}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              title="Ανανέωση"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50"
              style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', color: 'var(--accent)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.22)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.12)'; }}
            >
              <span className={spinning ? 'inline-block animate-spin' : ''} style={{ display: 'inline-block' }}>↻</span>
              {refreshing ? 'Φόρτωση…' : 'Ανανέωση'}
            </button>
          </div>
        </div>

        {/* Divider strip */}
        <div className="mt-6 h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent)' }} />
      </div>
    </header>
  );
}
