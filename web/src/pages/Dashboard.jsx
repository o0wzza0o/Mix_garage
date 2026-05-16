import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Heart, MessageCircle, Pencil, Plus, Trash2, CircleDot } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore.js';
import { fetchListings, deleteListing, updateListing } from '../services/listings.js';
import { supabase } from '../lib/supabase.js';
import { formatPrice, timeAgo } from '../utils/format.js';
import EmptyState from '../components/EmptyState.jsx';
import { LineSkeleton } from '../components/Skeletons.jsx';

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState({ favs: {}, msgs: {} });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { rows } = await fetchListings({ sellerId: user.id, status: null, pageSize: 100, sort: 'newest' });
      setRows(rows);
      const ids = rows.map((r) => r.id);
      if (ids.length) {
        const [{ data: favs }, { data: msgs }] = await Promise.all([
          supabase.from('mg_favourites').select('listing_id').in('listing_id', ids),
          supabase.from('mg_conversations').select('id, listing_id').in('listing_id', ids),
        ]);
        const favCount = {}; (favs || []).forEach((f) => { favCount[f.listing_id] = (favCount[f.listing_id] || 0) + 1; });
        const msgCount = {}; (msgs || []).forEach((m) => { msgCount[m.listing_id] = (msgCount[m.listing_id] || 0) + 1; });
        setStats({ favs: favCount, msgs: msgCount });
      }
    } finally { setLoading(false); }
  };

  useEffect(() => { if (user) load(); /* eslint-disable-next-line */ }, [user]);

  const remove = async (id) => {
    if (!confirm('Delete this listing? This cannot be undone.')) return;
    try { await deleteListing(id); toast.success('Deleted'); load(); }
    catch (e) { toast.error(e.message); }
  };

  const setStatus = async (id, status) => {
    try { await updateListing(id, { status }); toast.success('Status updated'); load(); }
    catch (e) { toast.error(e.message); }
  };

  const totals = rows.reduce((acc, r) => {
    acc.views += r.views_count || 0;
    acc.favs += stats.favs[r.id] || 0;
    acc.msgs += stats.msgs[r.id] || 0;
    return acc;
  }, { views: 0, favs: 0, msgs: 0 });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold">Seller dashboard</h1>
          <p className="text-sm text-slate-500">Manage your listings and track performance.</p>
        </div>
        <Link to="/sell" className="btn-primary"><Plus className="w-4 h-4" />New listing</Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Stat label="Active listings" value={rows.filter((r) => r.status === 'active').length} />
        <Stat label="Total views" value={totals.views} icon={Eye} />
        <Stat label="Favourites" value={totals.favs} icon={Heart} />
        <Stat label="Messages" value={totals.msgs} icon={MessageCircle} />
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="card p-4"><LineSkeleton /><LineSkeleton className="mt-2 w-1/2" /></div>)}</div>
      ) : rows.length === 0 ? (
        <EmptyState title="No listings yet" subtitle="Create your first listing to start selling." action={<Link to="/sell" className="btn-primary">Create listing</Link>} />
      ) : (
        <div className="space-y-3">
          {rows.map((r) => {
            const cover = r.images?.slice().sort((a, b) => a.order_index - b.order_index)[0]?.url;
            return (
              <div key={r.id} className="card p-3 flex flex-col sm:flex-row gap-3">
                <Link to={`/listings/${r.id}`} className="w-full sm:w-40 aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                  {cover ? <img src={cover} className="w-full h-full object-cover" /> : null}
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <Link to={`/listings/${r.id}`} className="font-semibold hover:text-brand-700 line-clamp-1">{r.title}</Link>
                      <div className="text-brand-700 dark:text-brand-400 font-bold">{formatPrice(r.price)}</div>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span>Posted {timeAgo(r.created_at)}</span>
                    <span className="inline-flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{r.views_count} views</span>
                    <span className="inline-flex items-center gap-1"><Heart className="w-3.5 h-3.5" />{stats.favs[r.id] || 0}</span>
                    <span className="inline-flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" />{stats.msgs[r.id] || 0}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link to={`/listings/${r.id}/edit`} className="btn-secondary text-xs px-3 py-1.5"><Pencil className="w-3.5 h-3.5" />Edit</Link>
                    {r.status !== 'sold' ? (
                      <button onClick={() => setStatus(r.id, 'sold')} className="btn-secondary text-xs px-3 py-1.5"><CircleDot className="w-3.5 h-3.5" />Mark sold</button>
                    ) : (
                      <button onClick={() => setStatus(r.id, 'active')} className="btn-secondary text-xs px-3 py-1.5">Re-activate</button>
                    )}
                    {r.status === 'active' ? (
                      <button onClick={() => setStatus(r.id, 'hidden')} className="btn-secondary text-xs px-3 py-1.5">Hide</button>
                    ) : r.status === 'hidden' ? (
                      <button onClick={() => setStatus(r.id, 'active')} className="btn-secondary text-xs px-3 py-1.5">Unhide</button>
                    ) : null}
                    <button onClick={() => remove(r.id)} className="btn-secondary text-xs px-3 py-1.5 text-rose-600"><Trash2 className="w-3.5 h-3.5" />Delete</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, icon: Icon }) {
  return (
    <div className="card p-4">
      <div className="text-xs text-slate-500 flex items-center gap-1.5">{Icon && <Icon className="w-3.5 h-3.5" />}{label}</div>
      <div className="text-2xl font-extrabold mt-1">{value}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    active:  'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
    sold:    'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300',
    hidden:  'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
    pending: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300',
  };
  return <span className={`chip capitalize ${map[status] || ''}`}>{status}</span>;
}
