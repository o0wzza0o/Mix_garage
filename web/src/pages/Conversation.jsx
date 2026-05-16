import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore.js';
import { supabase } from '../lib/supabase.js';
import { fetchMessages, sendMessage, subscribeToMessages } from '../services/messaging.js';
import { formatPrice, timeAgo } from '../utils/format.js';

export default function Conversation() {
  const { id } = useParams();
  const user = useAuthStore((s) => s.user);
  const [conv, setConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await supabase
        .from('mg_conversations')
        .select(`*,
          listing:mg_listings(id, title, price, images:mg_listing_images(url, order_index)),
          buyer:profiles!mg_conversations_buyer_id_fkey(id, full_name, avatar_url),
          seller:profiles!mg_conversations_seller_id_fkey(id, full_name, avatar_url)
        `)
        .eq('id', id)
        .maybeSingle();
      if (alive) setConv(data);
      const msgs = await fetchMessages(id);
      if (alive) setMessages(msgs);
    })();
    const unsub = subscribeToMessages(id, (m) => setMessages((arr) => [...arr, m]));
    return () => { alive = false; unsub?.(); };
  }, [id]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages.length]);

  if (!conv) return <div className="p-10 text-center text-slate-500">Loading…</div>;

  const other = conv.buyer_id === user.id ? conv.seller : conv.buyer;
  const cover = conv.listing?.images?.slice().sort((a, b) => a.order_index - b.order_index)[0]?.url;

  const submit = async (e) => {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    setBusy(true);
    setText('');
    try {
      await sendMessage({ conversationId: id, senderId: user.id, body });
    } catch (err) {
      toast.error(err.message);
      setText(body);
    } finally { setBusy(false); }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col h-[calc(100vh-4rem)]">
      <div className="card p-3 flex items-center gap-3 mb-3">
        <Link to="/messages" className="btn-ghost p-2"><ArrowLeft className="w-4 h-4 rtl-flip" /></Link>
        <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
          {cover ? <img src={cover} className="w-full h-full object-cover" /> : null}
        </div>
        <div className="flex-1 min-w-0">
          <Link to={`/listings/${conv.listing_id}`} className="font-semibold truncate hover:text-brand-700 block">{conv.listing?.title}</Link>
          <div className="text-xs text-slate-500">{formatPrice(conv.listing?.price)} · with {other?.full_name}</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pb-4">
        {messages.length === 0 && (
          <div className="text-center text-sm text-slate-400 py-10">Start the conversation 👋</div>
        )}
        {messages.map((m) => {
          const mine = m.sender_id === user.id;
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-sm shadow-sm ${
                mine ? 'bg-brand-700 text-white rounded-br-sm' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-bl-sm'
              }`}>
                <div className="whitespace-pre-wrap break-words">{m.body}</div>
                <div className={`text-[10px] mt-1 ${mine ? 'text-white/70' : 'text-slate-400'}`}>{timeAgo(m.created_at)}</div>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <form onSubmit={submit} className="card p-2 flex items-center gap-2 sticky bottom-0">
        <input
          className="input border-0 focus:ring-0 flex-1"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button disabled={busy || !text.trim()} className="btn-primary px-4"><Send className="w-4 h-4" /></button>
      </form>
    </div>
  );
}
