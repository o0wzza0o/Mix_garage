import { supabase } from '../lib/supabase.js';

const LISTING_SELECT = `
  *,
  seller:profiles!mg_listings_seller_id_fkey ( id, full_name, avatar_url, phone, whatsapp, city, governorate ),
  images:mg_listing_images ( id, url, order_index )
`;

export async function fetchListings({
  page = 1,
  pageSize = 12,
  search = '',
  make = '',
  model = '',
  fuel = '',
  city = '',
  governorate = '',
  yearMin,
  yearMax,
  priceMin,
  priceMax,
  sort = 'newest',
  status = 'active',
  sellerId,
} = {}) {
  let q = supabase.from('mg_listings').select(LISTING_SELECT, { count: 'exact' });

  if (status) q = q.eq('status', status);
  if (sellerId) q = q.eq('seller_id', sellerId);
  if (make) q = q.eq('make', make);
  if (model) q = q.ilike('model', `%${model}%`);
  if (fuel) q = q.eq('fuel_type', fuel);
  if (city) q = q.ilike('city', `%${city}%`);
  if (governorate) q = q.eq('governorate', governorate);
  if (yearMin) q = q.gte('year', yearMin);
  if (yearMax) q = q.lte('year', yearMax);
  if (priceMin) q = q.gte('price', priceMin);
  if (priceMax) q = q.lte('price', priceMax);

  if (search?.trim()) {
    const term = search.trim().replace(/[%]/g, '');
    q = q.or(`title.ilike.%${term}%,description.ilike.%${term}%,make.ilike.%${term}%,model.ilike.%${term}%`);
  }

  if (sort === 'price_asc') q = q.order('price', { ascending: true });
  else if (sort === 'price_desc') q = q.order('price', { ascending: false });
  else q = q.order('created_at', { ascending: false });

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  q = q.range(from, to);

  const { data, error, count } = await q;
  if (error) throw error;
  return { rows: data ?? [], count: count ?? 0 };
}

export async function fetchListingById(id) {
  const { data, error } = await supabase
    .from('mg_listings')
    .select(LISTING_SELECT)
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function incrementViews(id) {
  await supabase.rpc('mg_increment_views', { p_listing_id: id });
}

export async function createListing(payload) {
  const { data, error } = await supabase.from('mg_listings').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updateListing(id, patch) {
  const { data, error } = await supabase.from('mg_listings').update(patch).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteListing(id) {
  const { error } = await supabase.from('mg_listings').delete().eq('id', id);
  if (error) throw error;
}

export async function uploadListingImage(userId, listingId, file, orderIndex = 0) {
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const path = `${userId}/${listingId}/${Date.now()}-${orderIndex}.${ext}`;
  const { error: upErr } = await supabase.storage.from('listing-images').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || 'image/jpeg',
  });
  if (upErr) throw upErr;
  const { data: pub } = supabase.storage.from('listing-images').getPublicUrl(path);
  const { data, error } = await supabase
    .from('mg_listing_images')
    .insert({ listing_id: listingId, url: pub.publicUrl, storage_path: path, order_index: orderIndex })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteListingImage(image) {
  if (image.storage_path) {
    await supabase.storage.from('listing-images').remove([image.storage_path]);
  }
  await supabase.from('mg_listing_images').delete().eq('id', image.id);
}

export async function fetchRelated(listing, limit = 6) {
  let q = supabase
    .from('mg_listings')
    .select(LISTING_SELECT)
    .eq('status', 'active')
    .neq('id', listing.id)
    .limit(limit);
  if (listing.make) q = q.eq('make', listing.make);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}
