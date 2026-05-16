import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Shield, MessageCircle, Tag, ArrowRight } from 'lucide-react';
import { useI18n } from '../utils/i18n.jsx';
import { fetchListings } from '../services/listings.js';
import ListingCard from '../components/ListingCard.jsx';
import { GridSkeleton } from '../components/Skeletons.jsx';
import { useFavourites } from '../hooks/useFavourites.js';
import { POPULAR_MAKES } from '../utils/constants.js';

export default function Home() {
  const { t } = useI18n();
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isFav, toggle } = useFavourites();

  useEffect(() => {
    (async () => {
      try {
        const { rows } = await fetchListings({ pageSize: 8 });
        setRecent(rows);
      } finally { setLoading(false); }
    })();
  }, []);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-700 via-brand-800 to-brand-900" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, white 0%, transparent 30%), radial-gradient(circle at 80% 60%, white 0%, transparent 25%)' }} />
        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-28 text-white">
          <div className="max-w-2xl animate-slide-up">
            <span className="inline-block px-3 py-1 rounded-full bg-white/15 backdrop-blur text-xs font-semibold mb-4">🚗 {t('app.name')}</span>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight">
              {t('home.hero.title')}
            </h1>
            <p className="mt-4 text-lg text-white/85">{t('home.hero.subtitle')}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/browse" className="btn bg-white text-brand-800 hover:bg-brand-50 font-bold"><Search className="w-4 h-4" />{t('home.hero.cta')}</Link>
              <Link to="/sell" className="btn bg-accent-500 hover:bg-accent-600 text-white">{t('home.hero.sell')} <ArrowRight className="w-4 h-4 rtl-flip" /></Link>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="max-w-7xl mx-auto px-4 -mt-10 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: Shield, title: 'Verified sellers', desc: 'Profiles and listings reviewed for trust.' },
            { icon: Tag, title: 'Best deals', desc: 'Compare prices and negotiate easily.' },
            { icon: MessageCircle, title: 'Direct chat', desc: 'Message sellers in real time.' },
          ].map((f, i) => (
            <div key={i} className="card p-5 flex items-start gap-3 shadow-soft">
              <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-700/20 grid place-items-center text-brand-700 dark:text-brand-400">
                <f.icon className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold">{f.title}</div>
                <div className="text-sm text-slate-500">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MAKES */}
      <section className="max-w-7xl mx-auto px-4 mt-12">
        <h2 className="text-xl font-bold mb-4">Popular makes</h2>
        <div className="flex flex-wrap gap-2">
          {POPULAR_MAKES.slice(0, 14).map((m) => (
            <Link key={m} to={`/browse?make=${encodeURIComponent(m)}`}
              className="px-3.5 py-2 rounded-xl text-sm font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500 hover:text-brand-700 transition">
              {m}
            </Link>
          ))}
        </div>
      </section>

      {/* RECENT */}
      <section className="max-w-7xl mx-auto px-4 mt-12 mb-16">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{t('home.recent')}</h2>
          <Link to="/browse" className="text-sm font-semibold text-brand-700 hover:underline inline-flex items-center gap-1">View all <ArrowRight className="w-4 h-4 rtl-flip" /></Link>
        </div>
        {loading ? <GridSkeleton count={8} /> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {recent.map((l) => <ListingCard key={l.id} listing={l} isFav={isFav(l.id)} onToggleFav={toggle} />)}
          </div>
        )}
      </section>
    </div>
  );
}
