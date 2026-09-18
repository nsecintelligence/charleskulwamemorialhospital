import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Code, Copy, Check, Globe, Lock, Zap, Server } from 'lucide-react';

interface Endpoint {
  method: string;
  path: string;
  description: string;
  params?: { name: string; type: string; description: string }[];
  example: string;
}

const endpoints: Endpoint[] = [
  {
    method: 'GET',
    path: '/api',
    description: 'API index — lists all available endpoints and metadata',
    example: 'fetch("/api")',
  },
  {
    method: 'GET',
    path: '/api/homepage',
    description: 'Homepage content: site name, logo, welcome text, hero image, announcements',
    example: 'fetch("/api/homepage")',
  },
  {
    method: 'GET',
    path: '/api/services',
    description: 'All hospital services with descriptions, images, and sort order',
    example: 'fetch("/api/services")',
  },
  {
    method: 'GET',
    path: '/api/departments',
    description: 'All hospital departments',
    example: 'fetch("/api/departments")',
  },
  {
    method: 'GET',
    path: '/api/doctors',
    description: 'All active specialist doctors with photos, specialties, and contact info',
    example: 'fetch("/api/doctors")',
  },
  {
    method: 'GET',
    path: '/api/news',
    description: 'Published news articles, paginated',
    params: [
      { name: 'limit', type: 'number', description: 'Items per page (default: 20)' },
      { name: 'offset', type: 'number', description: 'Skip items for pagination (default: 0)' },
    ],
    example: 'fetch("/api/news?limit=5&offset=0")',
  },
  {
    method: 'GET',
    path: '/api/news/:id',
    description: 'A single published news article by its ID',
    example: 'fetch("/api/news/abc-123-def")',
  },
  {
    method: 'GET',
    path: '/api/gallery',
    description: 'Gallery images, optionally filtered by category',
    params: [
      { name: 'category', type: 'string', description: 'Filter by gallery category' },
    ],
    example: 'fetch("/api/gallery?category=Events")',
  },
  {
    method: 'GET',
    path: '/api/faq',
    description: 'Frequently asked questions',
    example: 'fetch("/api/faq")',
  },
  {
    method: 'GET',
    path: '/api/contact',
    description: 'Contact information: address, phone, email, social media links',
    example: 'fetch("/api/contact")',
  },
  {
    method: 'GET',
    path: '/api/prices',
    description: 'Active service prices',
    example: 'fetch("/api/prices")',
  },
  {
    method: 'GET',
    path: '/api/forms',
    description: 'Active downloadable forms and documents',
    example: 'fetch("/api/forms")',
  },
];

export default function ApiDocs() {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-slate-900 text-white">
        <div className="container-width py-16 lg:py-24">
          <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-sm">
            <ArrowLeft className="w-4 h-4" />
            Back to website
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center">
              <Code className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">Public API</h1>
          </div>
          <p className="text-lg text-slate-300 max-w-2xl">
            A read-only JSON API that lets other websites and applications fetch public hospital data.
            No authentication required — just send a GET request.
          </p>
        </div>
      </div>

      <div className="container-width py-12 lg:py-16">
        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center mb-4">
              <Globe className="w-5 h-5 text-emerald-700" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">CORS Enabled</h3>
            <p className="text-sm text-slate-600">Any website can fetch data directly from the browser. Cross-origin requests are fully supported.</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
              <Lock className="w-5 h-5 text-blue-700" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">No Auth Needed</h3>
            <p className="text-sm text-slate-600">All endpoints are public and read-only. No API keys or tokens required — just fetch and go.</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center mb-4">
              <Zap className="w-5 h-5 text-amber-700" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Cached & Fast</h3>
            <p className="text-sm text-slate-600">Responses are cached at the edge for 5 minutes, so repeated requests are served instantly.</p>
          </div>
        </div>

        {/* Quick start */}
        <div className="bg-slate-900 rounded-xl p-6 mb-12 overflow-x-auto">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-3">
            <Server className="w-4 h-4" />
            Quick Start
          </div>
          <pre className="text-sm text-slate-300 leading-relaxed">
{`// Fetch all hospital services
const res = await fetch("https://your-domain.com/api/services");
const { services } = await res.json();

// Fetch latest 5 news articles
const res = await fetch("https://your-domain.com/api/news?limit=5");
const { news, total } = await res.json();

// Get homepage content
const res = await fetch("https://your-domain.com/api/homepage");
const { homepage } = await res.json();`}
          </pre>
        </div>

        {/* Endpoints */}
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Endpoints</h2>
        <div className="space-y-4">
          {endpoints.map((ep) => (
            <div key={ep.path} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-700 text-xs font-bold tracking-wide">
                  {ep.method}
                </span>
                <code className="text-slate-900 font-mono text-sm font-semibold">{ep.path}</code>
              </div>
              <p className="text-sm text-slate-600 mb-4">{ep.description}</p>

              {ep.params && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Query Parameters</p>
                  <div className="space-y-1.5">
                    {ep.params.map((p) => (
                      <div key={p.name} className="flex items-baseline gap-2 text-sm">
                        <code className="text-emerald-700 font-mono">{p.name}</code>
                        <span className="text-slate-400 text-xs">{p.type}</span>
                        <span className="text-slate-600">{p.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-slate-50 rounded-lg p-3 flex items-center justify-between gap-3">
                <code className="text-sm text-slate-700 font-mono flex-1 overflow-x-auto">{ep.example}</code>
                <button
                  onClick={() => copyToClipboard(ep.example)}
                  className="flex-shrink-0 text-slate-400 hover:text-slate-700 transition-colors"
                  aria-label="Copy to clipboard"
                >
                  {copied === ep.example ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Response format */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Response Format</h2>
          <div className="bg-slate-900 rounded-xl p-6 overflow-x-auto">
            <pre className="text-sm text-slate-300 leading-relaxed">
{`// All endpoints return JSON with a top-level key matching the resource name:

{
  "services": [
    {
      "id": "uuid",
      "name": "Emergency Care",
      "description": "24/7 emergency medical services",
      "image_url": "https://...",
      "featured": true,
      "sort_order": 0
    }
  ]
}

// News includes pagination metadata:
{
  "news": [...],
  "total": 42,
  "limit": 20,
  "offset": 0
}

// Errors return a 4xx/5xx status with:
{
  "error": "Description of what went wrong"
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
