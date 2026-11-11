import type { APIRoute } from 'astro';
import { posts } from '../lib/posts';
import { escapeXml as xml } from '../lib/discovery';

export const GET: APIRoute = ({ site }) => new Response(
  `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Barnaby Bishop</title><link>${site}</link><description>Posts by Barnaby Bishop</description>${posts.map((post) => {
    const url = xml(new URL('/' + post.slug, site).href);
    return `<item><title>${xml(post.title)}</title><link>${url}</link><guid>${url}</guid><description>${xml(post.description)}</description><pubDate>${new Date(post.published).toUTCString()}</pubDate></item>`;
  }).join('')}</channel></rss>`, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } },
);
