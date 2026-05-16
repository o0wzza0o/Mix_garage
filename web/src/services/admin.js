import { supabase } from '../lib/supabase.js';

export async function adminListUsers() {
  const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function adminUpdateUserRole(id, role) {
  const { data, error } = await supabase.from('profiles').update({ role }).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function adminListAllListings() {
  const { data, error } = await supabase
    .from('mg_listings')
    .select(`*, seller:profiles!mg_listings_seller_id_fkey(id, full_name, avatar_url), images:mg_listing_images(url, order_index)`)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function adminSetListingStatus(id, status) {
  const { data, error } = await supabase.from('mg_listings').update({ status }).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function adminStats() {
  const [usersC, listingsC, activeC, soldC, msgsC] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('mg_listings').select('id', { count: 'exact', head: true }),
    supabase.from('mg_listings').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('mg_listings').select('id', { count: 'exact', head: true }).eq('status', 'sold'),
    supabase.from('mg_messages').select('id', { count: 'exact', head: true }),
  ]);
  return {
    users: usersC.count ?? 0,
    listings: listingsC.count ?? 0,
    active: activeC.count ?? 0,
    sold: soldC.count ?? 0,
    messages: msgsC.count ?? 0,
  };
}
