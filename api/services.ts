import { supabase, jsonResponse, errorResponse, corsHeaders } from './_lib/supabase';

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return jsonResponse({ services: data });
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : 'Failed to fetch services');
  }
}
