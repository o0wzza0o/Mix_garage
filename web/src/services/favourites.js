import { supabase } from '../lib/supabase.js';

export async function listFavourites(userId) {
  const { data, error } = await supabase
    .from('mg_favourites')
    .select(`id, created_at, listing:mg_listings(*, images:mg_listing_images(id,url,order_index), seller:profiles!mg_listings_seller_id_fkey(id,full_name,avatar_url))`)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchFavouriteIds(userId) {
  if (!userId) return new Set();
  const { data, error } = await supabase.from('mg_favourites').select('listing_id').eq('user_id', userId);
  if (error) throw error;
  return new Set((data ?? []).map((r) => r.listing_id));
}

export async function addFavourite(userId, listingId) {
  const { error } = await supabase.from('mg_favourites').insert({ user_id: userId, listing_id: listingId });
  if (error && error.code !== '23505') throw error;
}

export async function removeFavourite(userId, listingId) {
  const { error } = await supabase
    .from('mg_favourites')
    .delete()
    .eq('user_id', userId)
    .eq('listing_id', listingId);
  if (error) throw error;
}
