const CATEGORY_STYLES = {
  'AI'          : 'bg-violet-500/15 text-violet-300 border-violet-500/30',
  'Machine Learning': 'bg-violet-500/15 text-violet-300 border-violet-500/30',
  'Security'    : 'bg-red-500/15 text-red-300 border-red-500/30',
  'Cybersecurity': 'bg-red-500/15 text-red-300 border-red-500/30',
  'Startups'    : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  'Venture'     : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  'Funding'     : 'bg-green-500/15 text-green-300 border-green-500/30',
  'Enterprise'  : 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  'Apps'        : 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  'Mobile'      : 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  'Cloud'       : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  'Hardware'    : 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
  'Transportation': 'bg-teal-500/15 text-teal-300 border-teal-500/30',
  'Health'      : 'bg-pink-500/15 text-pink-300 border-pink-500/30',
  'Fintech'     : 'bg-lime-500/15 text-lime-300 border-lime-500/30',
  'Social'      : 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  'default'     : 'bg-slate-500/15 text-slate-300 border-slate-500/30',
};

function getStyle(categories = []) {
  for (const cat of categories) {
    const key = Object.keys(CATEGORY_STYLES).find(
      (k) => k !== 'default' && cat.toLowerCase().includes(k.toLowerCase())
    );
    if (key) return CATEGORY_STYLES[key];
  }
  return CATEGORY_STYLES.default;
}

export default function CategoryBadge({ categories = [], size = 'sm' }) {
  const label = categories[0] || 'Tech';
  const style = getStyle(categories);
  const sz    = size === 'xs' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center rounded-full border font-semibold tracking-wide uppercase ${sz} ${style}`}>
      {label}
    </span>
  );
}
