import type { APIRoute } from 'astro';
import { posts } from '../lib/posts';
import { escapeXml as xml } from '../lib/discovery';

export const GET: APIRoute = ({ site }) => new Response(
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[
    ...['/', '/about'].map((path) => `<url><loc>${xml(new URL(path, site).href)}</loc></url>`),
    ...posts.map((post) => `<url><loc>${xml(new URL('/' + post.slug, site).href)}</loc><lastmod>${post.modified ?? post.published}</lastmod></url>`),
  ].join('')}</urlset>`, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
);
