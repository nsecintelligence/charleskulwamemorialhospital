import { supabase, jsonResponse, errorResponse, corsHeaders } from '../_lib/supabase';

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();

    if (!id) {
      return errorResponse('News ID is required', 400);
    }

    const { data, error } = await supabase
      .from('news')
      .select('*')
      .eq('id', id)
      .eq('is_published', true)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return errorResponse('News article not found', 404);
    }
    return jsonResponse({ news: data });
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : 'Failed to fetch news article');
  }
}
