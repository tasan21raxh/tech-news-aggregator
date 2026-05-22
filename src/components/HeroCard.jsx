import BulletText    from './BulletText.jsx';
import CategoryBadge from './CategoryBadge.jsx';
import TimeAgo       from './TimeAgo.jsx';

const GRADIENTS = [
  'hero-gradient-violet',
  'hero-gradient-blue',
  'hero-gradient-teal',
  'hero-gradient-rose',
  'hero-gradient-amber',
];

function getGradient(guid = '') {
  const sum = [...guid].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return GRADIENTS[sum % GRADIENTS.length];
}

export default function HeroCard({ article }) {
  const gradient = getGradient(article.guid);

  return (
    <article
      className="relative rounded-2xl overflow-hidden animate-fade-in group cursor-pointer"
      style={{
        border    : '1px solid var(--border-md)',
        boxShadow : '0 25px 60px rgba(0,0,0,0.5)',
        minHeight : '420px',
      }}
      onClick={() => window.open(article.link, '_blank', 'noopener')}
    >
      {/* Background image or gradient */}
      {article.imageUrl ? (
        <div className="absolute inset-0">
          <img
            src={article.imageUrl}
            alt=""
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          {/* Dark overlay on image */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.7) 50%, rgba(0,0,0,0.2) 100%)' }} />
        </div>
      ) : (
        <div className={`absolute inset-0 ${gradient}`}>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 60%)' }} />
          {/* Decorative grid */}
          <div className="absolute inset-0 opacity-10"
               style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 40px,rgba(255,255,255,.1) 40px,rgba(255,255,255,.1) 41px),repeating-linear-gradient(90deg,transparent,transparent 40px,rgba(255,255,255,.1) 40px,rgba(255,255,255,.1) 41px)' }} />
        </div>
      )}

      {/* FEATURED badge */}
      <div className="absolute top-5 left-5 z-10">
        <span className="px-3 py-1.5 rounded-full text-xs font-black tracking-widest uppercase"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', boxShadow: '0 0 20px rgba(99,102,241,0.5)' }}>
          ⭐ Κορυφαίο
        </span>
      </div>

      {/* Source label */}
      {article.isMock && (
        <div className="absolute top-5 right-5 z-10">
          <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider"
                style={{ background: 'rgba(251,191,36,0.2)', border: '1px solid rgba(251,191,36,0.4)', color: '#fbbf24' }}>
            MOCK
          </span>
        </div>
      )}

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-6 md:p-8">
        <div className="flex items-center gap-3 mb-3">
          <CategoryBadge categories={article.categories} />
          <TimeAgo isoString={article.publishedAt} />
          {article.author && (
            <span className="text-xs" style={{ color: 'var(--muted)' }}>
              — {article.author}
            </span>
          )}
        </div>

        <h2 className="text-2xl md:text-4xl font-black text-white leading-tight mb-5 md:leading-[1.15] transition-colors group-hover:text-indigo-200">
          {article.greekTitle}
        </h2>

        {/* Bullets */}
        <ul className="space-y-2.5 mb-6">
          {(article.bullets || []).map((bullet, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="mt-[3px] w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: 'var(--accent)', boxShadow: '0 0 6px var(--accent)' }} />
              <p className="text-sm md:text-base leading-relaxed" style={{ color: 'rgba(226,232,240,0.9)' }}>
                <BulletText text={bullet} />
              </p>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <a
          href={article.link}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 hover:gap-3"
          style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', color: 'var(--accent)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.35)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.2)'; }}
        >
          Διαβάστε το πρωτότυπο άρθρο
          <span>→</span>
        </a>
      </div>
    </article>
  );
}
