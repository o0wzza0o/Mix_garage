import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, pageSize, total, onChange }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;
  const win = 1;
  const items = [];
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || (i >= page - win && i <= page + win)) items.push(i);
    else if (items[items.length - 1] !== '...') items.push('...');
  }
  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      <button onClick={() => onChange(Math.max(1, page - 1))} disabled={page === 1} className="btn-ghost px-2 py-2 disabled:opacity-30">
        <ChevronLeft className="w-4 h-4 rtl-flip" />
      </button>
      {items.map((it, idx) => it === '...' ? (
        <span key={idx} className="px-2 text-slate-400">…</span>
      ) : (
        <button key={idx} onClick={() => onChange(it)}
          className={`min-w-9 h-9 px-2 rounded-lg text-sm font-medium ${
            it === page ? 'bg-brand-700 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}>{it}</button>
      ))}
      <button onClick={() => onChange(Math.min(pages, page + 1))} disabled={page === pages} className="btn-ghost px-2 py-2 disabled:opacity-30">
        <ChevronRight className="w-4 h-4 rtl-flip" />
      </button>
    </div>
  );
}
