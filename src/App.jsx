import { useState, useEffect, useMemo } from 'react';
import Header      from './components/Header.jsx';
import NavTabs     from './components/NavTabs.jsx';
import ArticleGrid from './components/ArticleGrid.jsx';
import Footer      from './components/Footer.jsx';
import LoadingSkeleton from './components/LoadingSkeleton.jsx';

// ── Date filter helpers ─────────────────────────────────────────────────────

function isWithin(isoString, hours) {
  const ms = hours * 60 * 60 * 1000;
  return Date.now() - new Date(isoString).getTime() < ms;
}

function filterByTab(articles, tab) {
  switch (tab) {
    case 'today'  : return articles.filter((a) => isWithin(a.publishedAt, 24));
    case 'week'   : return articles.filter((a) => isWithin(a.publishedAt, 24 * 7));
    case 'archive': return articles.filter((a) => !isWithin(a.publishedAt, 24 * 7));
    default       : return articles;
  }
}

// ── App ────────────────────────────────────────────────────────────────────

export default function App() {
  const [articles,   setArticles]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [activeTab,  setActiveTab]  = useState('today');
  const [lastFetch,  setLastFetch]  = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNews = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res  = await fetch('/api/news');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setArticles(Array.isArray(data) ? data : []);
      setLastFetch(new Date());
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchNews(); }, []);

  // Auto-select the tab that has content
  useEffect(() => {
    if (articles.length === 0) return;
    const hasToday = articles.some((a) => isWithin(a.publishedAt, 24));
    const hasWeek  = articles.some((a) => isWithin(a.publishedAt, 24 * 7));
    if (hasToday)     setActiveTab('today');
    else if (hasWeek) setActiveTab('week');
    else              setActiveTab('archive');
  }, [articles]);

  const filtered = useMemo(() => filterByTab(articles, activeTab), [articles, activeTab]);

  const counts = useMemo(() => ({
    today  : articles.filter((a) => isWithin(a.publishedAt, 24)).length,
    week   : articles.filter((a) => isWithin(a.publishedAt, 24 * 7)).length,
    archive: articles.filter((a) => !isWithin(a.publishedAt, 24 * 7)).length,
  }), [articles]);

  const hasMock = articles.some((a) => a.isMock);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <Header lastFetch={lastFetch} onRefresh={() => fetchNews(true)} refreshing={refreshing} />

      <NavTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={counts}
        totalArticles={articles.length}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {hasMock && (
          <div className="mb-6 px-4 py-3 rounded-lg border text-sm flex items-center gap-2"
               style={{ background: 'rgba(251,191,36,0.08)', borderColor: 'rgba(251,191,36,0.25)', color: '#fbbf24' }}>
            <span>⚠️</span>
            <span>
              <strong>Mock Mode:</strong> Εμφανίζονται δείγματα δεδομένων χωρίς AI.
              Προσθέστε <code className="bg-black/30 px-1 rounded">ANTHROPIC_API_KEY</code> στο <code className="bg-black/30 px-1 rounded">.env</code> για πραγματική AI επεξεργασία.
            </span>
          </div>
        )}

        {error && (
          <div className="mb-6 px-4 py-3 rounded-lg border text-sm"
               style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.25)', color: '#f87171' }}>
            ⚠️ Σφάλμα φόρτωσης: {error} — Βεβαιωθείτε ότι ο backend server τρέχει στο{' '}
            <code>localhost:3001</code>.
          </div>
        )}

        {loading ? (
          <LoadingSkeleton />
        ) : (
          <ArticleGrid articles={filtered} tab={activeTab} />
        )}
      </main>

      <Footer totalArticles={articles.length} lastFetch={lastFetch} />
    </div>
  );
}
