import { supabase } from '../lib/supabase.js';

export async function listConversations(userId) {
  const { data, error } = await supabase
    .from('mg_conversations')
    .select(`*,
      listing:mg_listings ( id, title, price, images:mg_listing_images(url, order_index) ),
      buyer:profiles!mg_conversations_buyer_id_fkey ( id, full_name, avatar_url ),
      seller:profiles!mg_conversations_seller_id_fkey ( id, full_name, avatar_url )
    `)
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getOrCreateConversation({ listingId, buyerId, sellerId }) {
  const { data: existing } = await supabase
    .from('mg_conversations')
    .select('*')
    .eq('listing_id', listingId)
    .eq('buyer_id', buyerId)
    .maybeSingle();
  if (existing) return existing;
  const { data, error } = await supabase
    .from('mg_conversations')
    .insert({ listing_id: listingId, buyer_id: buyerId, seller_id: sellerId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function fetchMessages(conversationId) {
  const { data, error } = await supabase
    .from('mg_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function sendMessage({ conversationId, senderId, body }) {
  const { data, error } = await supabase
    .from('mg_messages')
    .insert({ conversation_id: conversationId, sender_id: senderId, body })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export function subscribeToMessages(conversationId, onInsert) {
  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'mg_messages', filter: `conversation_id=eq.${conversationId}` },
      (payload) => onInsert(payload.new)
    )
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}
