export default function TimeAgo({ isoString }) {
  if (!isoString) return null;

  const diff = Date.now() - new Date(isoString).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);

  let label;
  if (mins < 1)       label = 'μόλις τώρα';
  else if (mins < 60) label = `πριν ${mins} λ.`;
  else if (hours < 24) label = `πριν ${hours} ώρ.`;
  else if (days === 1) label = 'χθες';
  else if (days < 7)   label = `πριν ${days} μέρες`;
  else {
    label = new Date(isoString).toLocaleDateString('el-GR', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  }

  return (
    <time dateTime={isoString} style={{ color: 'var(--muted)' }} className="text-xs">
      {label}
    </time>
  );
}
