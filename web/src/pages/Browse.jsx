import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { fetchListings } from '../services/listings.js';
import ListingCard from '../components/ListingCard.jsx';
import { GridSkeleton } from '../components/Skeletons.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Pagination from '../components/Pagination.jsx';
import { useFavourites } from '../hooks/useFavourites.js';
import { useI18n } from '../utils/i18n.jsx';
import { FUEL_TYPES, POPULAR_MAKES, EG_GOVERNORATES, YEARS } from '../utils/constants.js';

const PAGE_SIZE = 12;

export default function Browse() {
  const { t } = useI18n();
  const [params, setParams] = useSearchParams();
  const { isFav, toggle } = useFavourites();

  const [rows, setRows] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filters = useMemo(() => ({
    page: Number(params.get('page')) || 1,
    search: params.get('q') || '',
    make: params.get('make') || '',
    model: params.get('model') || '',
    fuel: params.get('fuel') || '',
    governorate: params.get('gov') || '',
    yearMin: params.get('yearMin') || '',
    yearMax: params.get('yearMax') || '',
    priceMin: params.get('priceMin') || '',
    priceMax: params.get('priceMax') || '',
    sort: params.get('sort') || 'newest',
  }), [params]);

  const setFilter = (key, val) => {
    const next = new URLSearchParams(params);
    if (val === '' || val == null) next.delete(key);
    else next.set(key, val);
    if (key !== 'page') next.delete('page');
    setParams(next, { replace: true });
  };

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchListings({
      page: filters.page,
      pageSize: PAGE_SIZE,
      search: filters.search,
      make: filters.make,
      model: filters.model,
      fuel: filters.fuel,
      governorate: filters.governorate,
      yearMin: filters.yearMin || undefined,
      yearMax: filters.yearMax || undefined,
      priceMin: filters.priceMin || undefined,
      priceMax: filters.priceMax || undefined,
      sort: filters.sort,
    }).then((res) => {
      if (!alive) return;
      setRows(res.rows); setCount(res.count);
    }).finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [filters]);

  const clearAll = () => setParams(new URLSearchParams(), { replace: true });

  const FilterPanel = (
    <div className="space-y-4">
      <div>
        <label className="label">Make</label>
        <select className="input" value={filters.make} onChange={(e) => setFilter('make', e.target.value)}>
          <option value="">All</option>
          {POPULAR_MAKES.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      <div>
        <label className="label">Model</label>
        <input className="input" placeholder="e.g. Corolla" value={filters.model} onChange={(e) => setFilter('model', e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="label">Year from</label>
          <select className="input" value={filters.yearMin} onChange={(e) => setFilter('yearMin', e.target.value)}>
            <option value="">Any</option>
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Year to</label>
          <select className="input" value={filters.yearMax} onChange={(e) => setFilter('yearMax', e.target.value)}>
            <option value="">Any</option>
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="label">Price min</label>
          <input className="input" type="number" min="0" value={filters.priceMin} onChange={(e) => setFilter('priceMin', e.target.value)} />
        </div>
        <div>
          <label className="label">Price max</label>
          <input className="input" type="number" min="0" value={filters.priceMax} onChange={(e) => setFilter('priceMax', e.target.value)} />
        </div>
      </div>
      <div>
        <label className="label">Fuel</label>
        <select className="input" value={filters.fuel} onChange={(e) => setFilter('fuel', e.target.value)}>
          <option value="">Any</option>
          {FUEL_TYPES.map((f) => <option key={f} value={f} className="capitalize">{f}</option>)}
        </select>
      </div>
      <div>
        <label className="label">Governorate</label>
        <select className="input" value={filters.governorate} onChange={(e) => setFilter('gov', e.target.value)}>
          <option value="">Any</option>
          {EG_GOVERNORATES.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>
      <button onClick={clearAll} className="btn-secondary w-full"><X className="w-4 h-4" />{t('common.clear')}</button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-5">
        <h1 className="text-2xl font-bold flex-1">{t('browse.title')}</h1>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="input pl-9 rtl:pl-4 rtl:pr-9"
            placeholder={t('browse.search')}
            defaultValue={filters.search}
            onKeyDown={(e) => { if (e.key === 'Enter') setFilter('q', e.currentTarget.value); }}
          />
        </div>
        <select className="input max-w-xs" value={filters.sort} onChange={(e) => setFilter('sort', e.target.value)}>
          <option value="newest">{t('browse.sort.newest')}</option>
          <option value="price_asc">{t('browse.sort.price_asc')}</option>
          <option value="price_desc">{t('browse.sort.price_desc')}</option>
        </select>
        <button onClick={() => setFiltersOpen(true)} className="md:hidden btn-secondary"><SlidersHorizontal className="w-4 h-4" />{t('browse.filters')}</button>
      </div>

      <div className="grid md:grid-cols-[260px_1fr] gap-6">
        <aside className="hidden md:block sticky top-20 self-start card p-4 max-h-[calc(100vh-6rem)] overflow-auto">
          <h3 className="font-bold mb-3 flex items-center gap-2"><SlidersHorizontal className="w-4 h-4" />{t('browse.filters')}</h3>
          {FilterPanel}
        </aside>

        <div>
          <div className="text-sm text-slate-500 mb-3">{count} results</div>
          {loading ? <GridSkeleton count={9} /> : rows.length === 0 ? (
            <EmptyState title={t('browse.empty.title')} subtitle={t('browse.empty.sub')} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {rows.map((l) => <ListingCard key={l.id} listing={l} isFav={isFav(l.id)} onToggleFav={toggle} />)}
            </div>
          )}
          <Pagination page={filters.page} pageSize={PAGE_SIZE} total={count} onChange={(p) => setFilter('page', p)} />
        </div>
      </div>

      {filtersOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 md:hidden" onClick={() => setFiltersOpen(false)}>
          <div className="absolute right-0 rtl:right-auto rtl:left-0 top-0 h-full w-80 max-w-[85vw] bg-white dark:bg-slate-950 p-5 overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">{t('browse.filters')}</h3>
              <button onClick={() => setFiltersOpen(false)} className="btn-ghost p-1.5"><X className="w-4 h-4" /></button>
            </div>
            {FilterPanel}
          </div>
        </div>
      )}
    </div>
  );
}
