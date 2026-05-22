import HeroCard   from './HeroCard.jsx';
import ArticleCard from './ArticleCard.jsx';
import EmptyState  from './EmptyState.jsx';

export default function ArticleGrid({ articles, tab }) {
  if (!articles || articles.length === 0) {
    return <EmptyState tab={tab} />;
  }

  const [hero, ...rest] = articles;

  return (
    <div className="space-y-8">
      {/* Hero — first/featured article */}
      <HeroCard article={hero} />

      {/* Grid of remaining articles */}
      {rest.length > 0 && (
        <>
          <div className="flex items-center gap-4">
            <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
              Περισσότερα άρθρα
            </span>
            <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {rest.map((article, i) => (
              <ArticleCard key={article.guid} article={article} index={i} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
