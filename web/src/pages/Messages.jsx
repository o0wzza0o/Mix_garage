import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore.js';
import { listConversations } from '../services/messaging.js';
import EmptyState from '../components/EmptyState.jsx';
import { LineSkeleton } from '../components/Skeletons.jsx';
import { timeAgo, formatPrice } from '../utils/format.js';

export default function Messages() {
  const user = useAuthStore((s) => s.user);
  const [convs, setConvs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    listConversations(user.id).then(setConvs).finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-extrabold mb-6">Messages</h1>
      {loading ? (
        <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="card p-4"><LineSkeleton className="w-2/3" /><LineSkeleton className="w-1/2 mt-2" /></div>)}</div>
      ) : convs.length === 0 ? (
        <EmptyState icon={MessageCircle} title="No conversations yet" subtitle="Start by messaging a seller from a listing." />
      ) : (
        <div className="space-y-2">
          {convs.map((c) => {
            const other = c.buyer_id === user.id ? c.seller : c.buyer;
            const cover = c.listing?.images?.slice().sort((a, b) => a.order_index - b.order_index)[0]?.url;
            return (
              <Link key={c.id} to={`/messages/${c.id}`} className="card p-3 flex gap-3 items-center hover:shadow-soft transition">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                  {cover ? <img src={cover} className="w-full h-full object-cover" /> : null}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="font-semibold truncate">{other?.full_name || 'User'}</div>
                    <div className="text-xs text-slate-400 shrink-0">{c.last_message_at ? timeAgo(c.last_message_at) : ''}</div>
                  </div>
                  <div className="text-xs text-slate-500 truncate">{c.listing?.title} · {formatPrice(c.listing?.price)}</div>
                  <div className="text-sm text-slate-700 dark:text-slate-300 truncate">{c.last_message || 'No messages yet'}</div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
