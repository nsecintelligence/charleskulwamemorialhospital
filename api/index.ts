import { jsonResponse, corsHeaders } from './_lib/supabase';

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  return jsonResponse({
    name: 'Hospital Public API',
    version: '1.0.0',
    description: 'Public read-only API for hospital data. All endpoints return JSON and support CORS.',
    endpoints: {
      'GET /api': 'This index — list of available endpoints',
      'GET /api/homepage': 'Homepage content (site name, logo, welcome text, hero, announcements)',
      'GET /api/services': 'All services offered by the hospital',
      'GET /api/departments': 'All hospital departments',
      'GET /api/doctors': 'Active specialist doctors',
      'GET /api/news': 'Published news articles (supports ?limit=20&offset=0)',
      'GET /api/news/:id': 'Single published news article by ID',
      'GET /api/gallery': 'Gallery images (supports ?category= filter)',
      'GET /api/faq': 'Frequently asked questions',
      'GET /api/contact': 'Contact information (address, phone, email, social links)',
      'GET /api/prices': 'Active service prices',
      'GET /api/forms': 'Active downloadable forms',
    },
    authentication: 'None required — all data is public and read-only.',
    rateLimit: 'Responses are cached for 5 minutes. Please respect reasonable request volumes.',
    cors: 'All endpoints support cross-origin requests (Access-Control-Allow-Origin: *)',
  });
}
