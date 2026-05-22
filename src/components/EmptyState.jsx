const MESSAGES = {
  today  : { icon: '⚡', title: 'Δεν υπάρχουν νέα σήμερα', body: 'Τρέξτε το pipeline για να φέρετε τα νέα της ημέρας.' },
  week   : { icon: '📅', title: 'Δεν υπάρχουν νέα για αυτή την εβδομάδα', body: 'Δεν βρέθηκαν άρθρα τις τελευταίες 7 ημέρες.' },
  archive: { icon: '🗂',  title: 'Το αρχείο είναι κενό', body: 'Δεν υπάρχουν παλαιότερα άρθρα αποθηκευμένα.' },
};

export default function EmptyState({ tab }) {
  const { icon, title, body } = MESSAGES[tab] || MESSAGES.today;

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
      <div className="text-6xl mb-6 opacity-40">{icon}</div>
      <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text)' }}>{title}</h3>
      <p className="text-sm max-w-sm" style={{ color: 'var(--muted)' }}>{body}</p>
      <div className="mt-8 px-4 py-2 rounded-lg text-sm" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted2)' }}>
        <code>cd backend &amp;&amp; npm run fetch</code>
      </div>
    </div>
  );
}
