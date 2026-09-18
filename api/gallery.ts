import { supabase, jsonResponse, errorResponse, corsHeaders } from './_lib/supabase';

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const category = url.searchParams.get('category');

    let query = supabase
      .from('gallery')
      .select('*')
      .order('sort_order', { ascending: true });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) throw error;
    return jsonResponse({ gallery: data });
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : 'Failed to fetch gallery');
  }
}
