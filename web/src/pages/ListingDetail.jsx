import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Heart, Share2, MapPin, Gauge, Calendar, Fuel, Settings2, Palette, BadgeCheck, MessageCircle, Phone, Eye, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchListingById, fetchRelated, incrementViews } from '../services/listings.js';
import { getOrCreateConversation } from '../services/messaging.js';
import { useAuthStore } from '../store/authStore.js';
import { useFavourites } from '../hooks/useFavourites.js';
import { formatPrice, formatNumber, timeAgo, buildWhatsAppLink } from '../utils/format.js';
import ImageGallery from '../components/ImageGallery.jsx';
import ListingCard from '../components/ListingCard.jsx';
import { LineSkeleton } from '../components/Skeletons.jsx';

export default function ListingDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { isFav, toggle } = useFavourites();

  const [listing, setListing] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    (async () => {
      try {
        const data = await fetchListingById(id);
        if (!alive) return;
        setListing(data);
        if (data) {
          incrementViews(id).catch(() => {});
          fetchRelated(data, 6).then((r) => alive && setRelated(r)).catch(() => {});
        }
      } finally { alive && setLoading(false); }
    })();
    return () => { alive = false; };
  }, [id]);

  const startChat = async () => {
    if (!user) { nav(`/auth?redirect=/listings/${id}`); return; }
    if (user.id === listing.seller_id) { toast.error("This is your own listing"); return; }
    try {
      const conv = await getOrCreateConversation({
        listingId: listing.id, buyerId: user.id, sellerId: listing.seller_id,
      });
      nav(`/messages/${conv.id}`);
    } catch (e) { toast.error(e.message); }
  };

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: listing.title, url });
      else { await navigator.clipboard.writeText(url); toast.success('Link copied'); }
    } catch {}
  };

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-6 grid lg:grid-cols-[1fr_360px] gap-6">
      <div className="aspect-[16/10] skeleton rounded-2xl" />
      <div className="space-y-3"><LineSkeleton className="w-2/3" /><LineSkeleton className="w-1/2 h-7" /><LineSkeleton /><LineSkeleton /></div>
    </div>
  );
  if (!listing) return <div className="max-w-7xl mx-auto px-4 py-12 text-center text-slate-500">Listing not found.</div>;

  const seller = listing.seller || {};
  const isOwner = user?.id === listing.seller_id;
  const fav = isFav(listing.id);

  const specs = [
    { icon: Calendar, label: 'Year', value: listing.year },
    { icon: Gauge, label: 'Mileage', value: listing.mileage != null ? `${formatNumber(listing.mileage)} km` : '—' },
    { icon: Fuel, label: 'Fuel', value: listing.fuel_type, cap: true },
    { icon: Settings2, label: 'Transmission', value: listing.transmission, cap: true },
    { icon: Palette, label: 'Color', value: listing.color, cap: true },
    { icon: BadgeCheck, label: 'Condition', value: listing.condition, cap: true },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div>
          <ImageGallery images={listing.images || []} />

          <div className="mt-6 card p-5">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-extrabold leading-tight">{listing.title}</h1>
                <div className="text-sm text-slate-500 mt-1 flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1"><MapPin className="w-4 h-4" />{[listing.city, listing.governorate].filter(Boolean).join(', ') || '—'}</span>
                  <span>•</span>
                  <span>{timeAgo(listing.created_at)}</span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1"><Eye className="w-4 h-4" />{listing.views_count} views</span>
                </div>
              </div>
              <button onClick={() => toggle(listing.id)} className="btn-secondary p-2.5" aria-label="Favourite">
                <Heart className={`w-5 h-5 ${fav ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>
              <button onClick={share} className="btn-secondary p-2.5" aria-label="Share"><Share2 className="w-5 h-5" /></button>
              {isOwner && (
                <Link to={`/listings/${listing.id}/edit`} className="btn-secondary p-2.5"><Pencil className="w-5 h-5" /></Link>
              )}
            </div>

            <div className="mt-4 text-3xl font-extrabold text-brand-700 dark:text-brand-400">
              {formatPrice(listing.price)}
              {listing.negotiable && <span className="ml-2 text-xs font-bold align-middle chip bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300">Negotiable</span>}
            </div>

            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {specs.map((s, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="w-9 h-9 rounded-lg bg-white dark:bg-slate-800 grid place-items-center text-brand-700 dark:text-brand-400">
                    <s.icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs text-slate-500">{s.label}</div>
                    <div className={`font-semibold text-sm truncate ${s.cap ? 'capitalize' : ''}`}>{s.value || '—'}</div>
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="w-9 h-9 rounded-lg bg-white dark:bg-slate-800 grid place-items-center text-brand-700 dark:text-brand-400">
                  <span className="text-xs font-bold">{listing.make?.[0]}</span>
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-slate-500">Make / Model</div>
                  <div className="font-semibold text-sm truncate">{listing.make} {listing.model}</div>
                </div>
              </div>
            </div>

            {listing.description && (
              <>
                <h3 className="font-bold mt-6 mb-2">Description</h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{listing.description}</p>
              </>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4 lg:sticky lg:top-20 self-start">
          <div className="card p-5">
            <h3 className="font-bold mb-3">Seller</h3>
            <div className="flex items-center gap-3">
              {seller.avatar_url ? (
                <img src={seller.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-brand-700 text-white grid place-items-center font-bold">
                  {(seller.full_name || '?')[0]?.toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <div className="font-semibold truncate">{seller.full_name || 'Seller'}</div>
                <div className="text-xs text-slate-500 truncate">{[seller.city, seller.governorate].filter(Boolean).join(', ')}</div>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {!isOwner && (
                <button onClick={startChat} className="btn-primary w-full"><MessageCircle className="w-4 h-4" />Message seller</button>
              )}
              {(listing.whatsapp || seller.whatsapp || seller.phone) && (
                <a
                  href={buildWhatsAppLink(listing.whatsapp || seller.whatsapp || seller.phone, `Hi, I'm interested in: ${listing.title}`)}
                  target="_blank" rel="noreferrer"
                  className="btn bg-emerald-600 hover:bg-emerald-700 text-white w-full"
                >
                  <Phone className="w-4 h-4" />WhatsApp
                </a>
              )}
            </div>
          </div>

          <div className="card p-5 text-sm text-slate-600 dark:text-slate-400">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2">Safety tips</h4>
            <ul className="list-disc pl-4 rtl:pr-4 rtl:pl-0 space-y-1">
              <li>Inspect the car before paying.</li>
              <li>Meet in a public place.</li>
              <li>Verify ownership documents.</li>
            </ul>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-12">
          <h3 className="text-xl font-bold mb-4">Related listings</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {related.map((l) => <ListingCard key={l.id} listing={l} isFav={isFav(l.id)} onToggleFav={toggle} />)}
          </div>
        </section>
      )}
    </div>
  );
}
