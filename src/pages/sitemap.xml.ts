import type { APIRoute } from 'astro';
import { canonicalUrl, publicPages } from '../lib/metadata';
import { posts } from '../lib/posts';
import { escapeXml as xml } from '../lib/discovery';

export const GET: APIRoute = () => new Response(
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[
    ...publicPages.map(({ path }) => `<url><loc>${xml(canonicalUrl(path))}</loc></url>`),
    ...posts.map((post) => `<url><loc>${xml(canonicalUrl('/' + post.slug))}</loc><lastmod>${post.modified ?? post.published}</lastmod></url>`),
  ].join('')}</urlset>`, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
);
