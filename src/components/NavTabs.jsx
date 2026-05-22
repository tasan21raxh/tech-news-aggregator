const TABS = [
  { id: 'today',   label: 'Σημερινά Νέα',   icon: '⚡', desc: 'Τελευταίες 24 ώρες' },
  { id: 'week',    label: 'Νέα Εβδομάδας',  icon: '📅', desc: 'Τελευταίες 7 ημέρες' },
  { id: 'archive', label: 'Αρχείο Μήνα',    icon: '🗂',  desc: 'Παλαιότερα άρθρα'   },
];

export default function NavTabs({ activeTab, onTabChange, counts, totalArticles }) {
  return (
    <div
      className="sticky top-0 z-50"
      style={{ background: 'rgba(7,7,17,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1 overflow-x-auto py-1" style={{ scrollbarWidth: 'none' }}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const count    = counts[tab.id] ?? 0;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="relative flex items-center gap-2.5 px-5 py-3.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 group"
                style={{
                  color     : isActive ? '#fff' : 'var(--muted)',
                  background: isActive ? 'rgba(99,102,241,0.18)' : 'transparent',
                  border    : isActive ? '1px solid rgba(99,102,241,0.35)' : '1px solid transparent',
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = 'var(--text)'; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = 'var(--muted)'; }}
              >
                {/* Active indicator line */}
                {isActive && (
                  <span
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-3/4 rounded-full"
                    style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }}
                  />
                )}

                <span className="text-base">{tab.icon}</span>

                <span className="font-semibold">{tab.label}</span>

                {/* Count badge */}
                {count > 0 && (
                  <span
                    className="px-1.5 py-0.5 rounded-full text-xs font-bold"
                    style={{
                      background: isActive ? 'rgba(129,140,248,0.25)' : 'rgba(255,255,255,0.06)',
                      color     : isActive ? 'var(--accent)' : 'var(--muted)',
                    }}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}

          {/* Right spacer + total count */}
          <div className="ml-auto pl-4 flex-shrink-0 flex items-center gap-2">
            <span className="text-xs" style={{ color: 'var(--muted)' }}>
              Σύνολο αρχείου:{' '}
              <span className="font-semibold" style={{ color: 'var(--muted2)' }}>
                {totalArticles}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
