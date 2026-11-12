import type { APIRoute } from 'astro';
import { canonicalUrl, siteName } from '../lib/metadata';
import { posts } from '../lib/posts';
import { escapeXml as xml } from '../lib/discovery';

export const GET: APIRoute = () => new Response(
  `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><atom:link href="${canonicalUrl('/rss.xml')}" rel="self" type="application/rss+xml"/><language>en</language><title>${siteName}</title><link>${canonicalUrl('/')}</link><description>Posts by Barnaby Bishop</description>${posts.map((post) => {
    const url = xml(canonicalUrl('/' + post.slug));
    return `<item><title>${xml(post.title)}</title><link>${url}</link><guid>${url}</guid><description>${xml(post.description)}</description><pubDate>${new Date(post.published).toUTCString()}</pubDate></item>`;
  }).join('')}</channel></rss>`, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } },
);
