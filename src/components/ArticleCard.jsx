import { useState } from 'react';
import BulletText    from './BulletText.jsx';
import CategoryBadge from './CategoryBadge.jsx';
import TimeAgo       from './TimeAgo.jsx';

const MINI_GRADIENTS = [
  'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
  'linear-gradient(135deg, #0c1445 0%, #1e3a8a 100%)',
  'linear-gradient(135deg, #042f2e 0%, #134e4a 100%)',
  'linear-gradient(135deg, #1f0616 0%, #831843 100%)',
  'linear-gradient(135deg, #1c1003 0%, #78350f 100%)',
  'linear-gradient(135deg, #0a192f 0%, #0f4c75 100%)',
];

function getCardGradient(guid = '') {
  const sum = [...guid].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return MINI_GRADIENTS[sum % MINI_GRADIENTS.length];
}

export default function ArticleCard({ article, index = 0 }) {
  const [imgErr, setImgErr] = useState(false);
  const gradient = getCardGradient(article.guid);

  return (
    <article
      className="group flex flex-col rounded-xl overflow-hidden transition-all duration-300 cursor-pointer animate-slide-up h-full"
      style={{
        background  : 'var(--card)',
        border      : '1px solid var(--border)',
        animationDelay: `${index * 40}ms`,
        animationFillMode: 'both',
      }}
      onClick={() => window.open(article.link, '_blank', 'noopener')}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--card-hover)';
        e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)';
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(99,102,241,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'var(--card)';
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Image / Gradient header */}
      <div className="relative h-40 overflow-hidden flex-shrink-0">
        {article.imageUrl && !imgErr ? (
          <img
            src={article.imageUrl}
            alt=""
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgErr(true)}
          />
        ) : (
          <div className="w-full h-full" style={{ background: gradient }} />
        )}
        {/* Overlay */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)' }} />

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <CategoryBadge categories={article.categories} size="xs" />
        </div>

        {/* Mock badge */}
        {article.isMock && (
          <div className="absolute top-3 right-3">
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase"
                  style={{ background: 'rgba(0,0,0,0.6)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)' }}>
              mock
            </span>
          </div>
        )}

        {/* Number indicator */}
        <div className="absolute bottom-3 right-3">
          <span className="text-xs font-black opacity-30 text-white">#{index + 2}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        {/* Meta */}
        <div className="flex items-center gap-2 mb-3">
          <TimeAgo isoString={article.publishedAt} />
          {article.author && (
            <>
              <span style={{ color: 'var(--muted)' }}>·</span>
              <span className="text-xs truncate" style={{ color: 'var(--muted)', maxWidth: '120px' }}>
                {article.author}
              </span>
            </>
          )}
        </div>

        {/* Title */}
        <h3 className="text-base font-bold leading-snug mb-4 line-clamp-3 transition-colors group-hover:text-indigo-300"
            style={{ color: 'var(--text)' }}>
          {article.greekTitle}
        </h3>

        {/* Bullets */}
        <ul className="space-y-2 flex-1">
          {(article.bullets || []).map((bullet, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-[5px] w-1 h-1 rounded-full flex-shrink-0 opacity-70"
                    style={{ background: 'var(--accent)' }} />
              <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--muted2)' }}>
                <BulletText text={bullet} />
              </p>
            </li>
          ))}
        </ul>

        {/* Footer */}
        <div className="mt-4 pt-4 flex items-center justify-between" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>TechCrunch</span>
          </div>
          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-xs font-semibold transition-colors"
            style={{ color: 'var(--muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--muted)'; }}
          >
            Πρωτότυπο →
          </a>
        </div>
      </div>
    </article>
  );
}
