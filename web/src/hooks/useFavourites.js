import { useEffect, useState, useCallback } from 'react';
import { fetchFavouriteIds, addFavourite, removeFavourite } from '../services/favourites.js';
import { useAuthStore } from '../store/authStore.js';
import toast from 'react-hot-toast';

export function useFavourites() {
  const user = useAuthStore((s) => s.user);
  const [ids, setIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) { setIds(new Set()); return; }
    setLoading(true);
    try { setIds(await fetchFavouriteIds(user.id)); }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const toggle = useCallback(async (listingId) => {
    if (!user) { toast.error('Please sign in to save favourites'); return; }
    const has = ids.has(listingId);
    const next = new Set(ids);
    if (has) next.delete(listingId); else next.add(listingId);
    setIds(next);
    try {
      if (has) await removeFavourite(user.id, listingId);
      else await addFavourite(user.id, listingId);
    } catch (e) {
      setIds(ids);
      toast.error(e.message || 'Could not update favourite');
    }
  }, [user, ids]);

  return { ids, isFav: (id) => ids.has(id), toggle, loading, refresh };
}
