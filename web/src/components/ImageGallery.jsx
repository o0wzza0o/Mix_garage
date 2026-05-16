import { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export default function ImageGallery({ images = [] }) {
  const sorted = images.slice().sort((a, b) => a.order_index - b.order_index);
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (!sorted.length) {
    return <div className="aspect-[16/10] rounded-2xl bg-slate-100 dark:bg-slate-800 grid place-items-center text-slate-400">No images</div>;
  }

  const next = () => setActive((a) => (a + 1) % sorted.length);
  const prev = () => setActive((a) => (a - 1 + sorted.length) % sorted.length);

  return (
    <div>
      <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 group">
        <img src={sorted[active].url} alt="" onClick={() => setLightbox(true)}
          className="w-full h-full object-cover cursor-zoom-in" />
        {sorted.length > 1 && (
          <>
            <button onClick={prev} className="absolute left-2 rtl:left-auto rtl:right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 dark:bg-slate-900/90 grid place-items-center hover:scale-110 transition">
              <ChevronLeft className="w-5 h-5 rtl-flip" />
            </button>
            <button onClick={next} className="absolute right-2 rtl:right-auto rtl:left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 dark:bg-slate-900/90 grid place-items-center hover:scale-110 transition">
              <ChevronRight className="w-5 h-5 rtl-flip" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-2.5 py-1 text-xs rounded-full bg-black/60 text-white">
              {active + 1} / {sorted.length}
            </div>
          </>
        )}
      </div>
      {sorted.length > 1 && (
        <div className="mt-3 grid grid-cols-6 sm:grid-cols-8 gap-2">
          {sorted.map((img, i) => (
            <button key={img.id || i} onClick={() => setActive(i)}
              className={`aspect-square rounded-lg overflow-hidden border-2 ${i === active ? 'border-brand-700' : 'border-transparent opacity-70 hover:opacity-100'}`}>
              <img src={img.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {lightbox && (
        <div className="fixed inset-0 bg-black/90 z-50 grid place-items-center p-4 animate-fade-in" onClick={() => setLightbox(false)}>
          <button className="absolute top-4 right-4 text-white/80 hover:text-white" onClick={() => setLightbox(false)}>
            <X className="w-7 h-7" />
          </button>
          <img src={sorted[active].url} alt="" className="max-h-[90vh] max-w-[95vw] object-contain" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
