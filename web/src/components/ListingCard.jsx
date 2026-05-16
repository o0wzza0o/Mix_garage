import { Link } from 'react-router-dom';
import { Heart, MapPin, Gauge, Calendar, Fuel } from 'lucide-react';
import { formatPrice, formatNumber } from '../utils/format.js';

export default function ListingCard({ listing, isFav, onToggleFav }) {
  const cover = (listing.images || []).slice().sort((a, b) => a.order_index - b.order_index)[0]?.url;
  return (
    <Link to={`/listings/${listing.id}`} className="group card overflow-hidden hover:shadow-soft transition animate-fade-in">
      <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-800 overflow-hidden">
        {cover ? (
          <img src={cover} alt={listing.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
        ) : (
          <div className="w-full h-full grid place-items-center text-slate-400 text-xs">No image</div>
        )}
        {listing.status === 'sold' && (
          <div className="absolute inset-0 bg-black/50 grid place-items-center">
            <span className="px-3 py-1 bg-rose-600 text-white text-xs font-bold rounded-full">SOLD</span>
          </div>
        )}
        {onToggleFav && (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFav(listing.id); }}
            className="absolute top-2 right-2 rtl:right-auto rtl:left-2 w-9 h-9 grid place-items-center rounded-full bg-white/90 dark:bg-slate-900/90 hover:scale-110 transition"
            aria-label="Toggle favourite"
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : 'text-slate-600 dark:text-slate-300'}`} />
          </button>
        )}
        {listing.negotiable && (
          <span className="absolute bottom-2 left-2 rtl:left-auto rtl:right-2 chip bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300">Negotiable</span>
        )}
      </div>
      <div className="p-3.5">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-brand-700">{listing.title}</h3>
        </div>
        <div className="text-brand-700 dark:text-brand-400 font-extrabold text-lg mt-0.5">{formatPrice(listing.price)}</div>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{listing.year}</span>
          {listing.mileage != null && <span className="inline-flex items-center gap-1"><Gauge className="w-3.5 h-3.5" />{formatNumber(listing.mileage)} km</span>}
          {listing.fuel_type && <span className="inline-flex items-center gap-1 capitalize"><Fuel className="w-3.5 h-3.5" />{listing.fuel_type}</span>}
          {listing.city && <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{listing.city}</span>}
        </div>
      </div>
    </Link>
  );
}
