/**
 * Parses **bold** markdown in bullet strings and renders them.
 * e.g. "**Χρηματοδότηση:** Κάτι σημαντικό" →
 *      <strong>Χρηματοδότηση:</strong> Κάτι σημαντικό
 */
export default function BulletText({ text = '', className = '' }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return (
    <span className={`bullet-text ${className}`}>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}
