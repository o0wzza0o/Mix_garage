import { useEffect, useState } from 'react';
import { Shield, Users, Car, MessageCircle, CheckCircle2, XCircle, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  adminListUsers, adminUpdateUserRole,
  adminListAllListings, adminSetListingStatus,
  adminStats,
} from '../services/admin.js';
import { deleteListing } from '../services/listings.js';
import { formatPrice, timeAgo } from '../utils/format.js';

export default function Admin() {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [s, u, l] = await Promise.all([adminStats(), adminListUsers(), adminListAllListings()]);
      setStats(s); setUsers(u); setListings(l);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const setRole = async (id, role) => {
    try { await adminUpdateUserRole(id, role); toast.success('Role updated'); load(); }
    catch (e) { toast.error(e.message); }
  };

  const setStatus = async (id, status) => {
    try { await adminSetListingStatus(id, status); toast.success('Status updated'); load(); }
    catch (e) { toast.error(e.message); }
  };

  const remove = async (id) => {
    if (!confirm('Delete this listing?')) return;
    try { await deleteListing(id); toast.success('Deleted'); load(); }
    catch (e) { toast.error(e.message); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-700/20 grid place-items-center text-brand-700 dark:text-brand-400"><Shield className="w-5 h-5" /></div>
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold">Admin panel</h1>
          <p className="text-sm text-slate-500">Manage users, listings, and platform health.</p>
        </div>
      </div>

      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-800 mb-6">
        {['overview', 'listings', 'users'].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-semibold capitalize border-b-2 transition ${
              tab === t ? 'border-brand-700 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}>{t}</button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Stat icon={Users} label="Users" value={stats?.users ?? '—'} />
          <Stat icon={Car} label="Listings" value={stats?.listings ?? '—'} />
          <Stat icon={CheckCircle2} label="Active" value={stats?.active ?? '—'} />
          <Stat icon={XCircle} label="Sold" value={stats?.sold ?? '—'} />
          <Stat icon={MessageCircle} label="Messages" value={stats?.messages ?? '—'} />
        </div>
      )}

      {tab === 'listings' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900 text-left">
                <tr>
                  <th className="p-3">Listing</th>
                  <th className="p-3">Seller</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Posted</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((l) => {
                  const cover = l.images?.slice().sort((a, b) => a.order_index - b.order_index)[0]?.url;
                  return (
                    <tr key={l.id} className="border-t border-slate-200 dark:border-slate-800">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">{cover && <img src={cover} className="w-full h-full object-cover" />}</div>
                          <a href={`/listings/${l.id}`} className="font-medium hover:text-brand-700 line-clamp-1">{l.title}</a>
                        </div>
                      </td>
                      <td className="p-3 text-slate-500">{l.seller?.full_name || '—'}</td>
                      <td className="p-3">{formatPrice(l.price)}</td>
                      <td className="p-3"><span className="chip capitalize">{l.status}</span></td>
                      <td className="p-3 text-slate-500">{timeAgo(l.created_at)}</td>
                      <td className="p-3 space-x-1 rtl:space-x-reverse whitespace-nowrap">
                        {l.status !== 'active' && <button onClick={() => setStatus(l.id, 'active')} className="btn-ghost text-xs px-2 py-1">Approve</button>}
                        {l.status !== 'hidden' && <button onClick={() => setStatus(l.id, 'hidden')} className="btn-ghost text-xs px-2 py-1">Hide</button>}
                        <button onClick={() => remove(l.id)} className="btn-ghost text-xs px-2 py-1 text-rose-600"><Trash2 className="w-3.5 h-3.5" /></button>
                      </td>
                    </tr>
                  );
                })}
                {!loading && listings.length === 0 && (
                  <tr><td colSpan={6} className="p-6 text-center text-slate-500">No listings.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900 text-left">
                <tr><th className="p-3">User</th><th className="p-3">Role</th><th className="p-3">Joined</th><th className="p-3">Actions</th></tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-slate-200 dark:border-slate-800">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {u.avatar_url ? <img src={u.avatar_url} className="w-8 h-8 rounded-full object-cover" /> :
                          <div className="w-8 h-8 rounded-full bg-brand-700 text-white grid place-items-center text-xs font-bold">{(u.full_name || '?')[0]?.toUpperCase()}</div>}
                        <div>
                          <div className="font-medium">{u.full_name || '—'}</div>
                          <div className="text-xs text-slate-500">{u.city || ''}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3"><span className="chip capitalize">{u.role}</span></td>
                    <td className="p-3 text-slate-500">{timeAgo(u.created_at)}</td>
                    <td className="p-3">
                      <select value={u.role} onChange={(e) => setRole(u.id, e.target.value)} className="input py-1.5 text-xs w-32">
                        <option value="buyer">buyer</option>
                        <option value="seller">seller</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="card p-4">
      <div className="text-xs text-slate-500 flex items-center gap-1.5"><Icon className="w-3.5 h-3.5" />{label}</div>
      <div className="text-2xl font-extrabold mt-1">{value}</div>
    </div>
  );
}
