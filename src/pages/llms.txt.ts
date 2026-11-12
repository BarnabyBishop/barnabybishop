import type { APIRoute } from 'astro';
import { canonicalUrl, publicPages, siteName, siteDescription } from '../lib/metadata';
import { posts } from '../lib/posts';
export const GET: APIRoute = () => new Response(
  `# ${siteName}\n\n> ${siteDescription}\n\n## Pages\n\n${publicPages.map((page) => `- [${page.title}](${canonicalUrl(page.path)})`).join('\n')}\n\n## Published posts\n\n${posts.map((post) =>
    `- [${post.title.replace(/[\r\n\[\]]/g, ' ')}](${canonicalUrl('/' + post.slug)}): ${post.description.replace(/[\r\n]/g, ' ')}\n`,
  ).join('')}`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
);
