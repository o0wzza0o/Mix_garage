import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { listFavourites } from '../services/favourites.js';
import { useAuthStore } from '../store/authStore.js';
import ListingCard from '../components/ListingCard.jsx';
import { GridSkeleton } from '../components/Skeletons.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { useFavourites } from '../hooks/useFavourites.js';

export default function Favourites() {
  const user = useAuthStore((s) => s.user);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isFav, toggle, refresh } = useFavourites();

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    listFavourites(user.id).then(setItems).finally(() => setLoading(false));
  }, [user]);

  const visible = items.filter((it) => it.listing && isFav(it.listing.id));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-extrabold mb-6">Your favourites</h1>
      {loading ? <GridSkeleton count={6} /> : visible.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No favourites yet"
          subtitle="Tap the heart on any listing to save it for later."
          action={<Link to="/browse" className="btn-primary">Browse cars</Link>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {visible.map((it) => (
            <ListingCard
              key={it.id}
              listing={it.listing}
              isFav={isFav(it.listing.id)}
              onToggleFav={async (id) => { await toggle(id); refresh(); }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
