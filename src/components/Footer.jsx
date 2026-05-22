export default function Footer({ totalArticles, lastFetch }) {
  const year = new Date().getFullYear();
  const lastStr = lastFetch
    ? lastFetch.toLocaleString('el-GR', { dateStyle: 'medium', timeStyle: 'short' })
    : '—';

  return (
    <footer className="mt-16 py-10" style={{ borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">

          {/* Left */}
          <div className="text-center md:text-left">
            <p className="font-bold gradient-text text-lg">TechPulse GR</p>
            <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
              Τα σημαντικότερα tech νέα, κάθε μέρα — επιλεγμένα με AI
            </p>
          </div>

          {/* Center stats */}
          <div className="flex items-center gap-6 text-xs" style={{ color: 'var(--muted)' }}>
            <div className="text-center">
              <p className="text-2xl font-black" style={{ color: 'var(--text)' }}>{totalArticles}</p>
              <p>άρθρα στο αρχείο</p>
            </div>
            <div className="h-10 w-px" style={{ background: 'var(--border)' }} />
            <div className="text-center">
              <p className="font-semibold" style={{ color: 'var(--text)' }}>{lastStr}</p>
              <p>τελευταία ενημέρωση</p>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--muted)' }}>
            <span>Πηγή:</span>
            <a href="https://techcrunch.com" target="_blank" rel="noopener noreferrer"
               className="font-semibold transition-colors hover:text-green-400" style={{ color: 'var(--muted2)' }}>
              TechCrunch
            </a>
            <span>·</span>
            <span>AI:</span>
            <a href="https://anthropic.com" target="_blank" rel="noopener noreferrer"
               className="font-semibold transition-colors hover:text-violet-400" style={{ color: 'var(--muted2)' }}>
              Claude
            </a>
          </div>
        </div>

        <div className="mt-8 text-center text-xs" style={{ color: 'var(--muted)', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
          © {year} TechPulse GR — Δεδομένα: TechCrunch RSS · Επεξεργασία: Anthropic Claude
        </div>
      </div>
    </footer>
  );
}
