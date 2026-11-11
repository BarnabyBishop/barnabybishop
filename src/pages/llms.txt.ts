import type { APIRoute } from 'astro';
import { posts } from '../lib/posts';
export const GET: APIRoute = ({ site }) => new Response(
  `# Barnaby Bishop\n\n> Personal website of Barnaby Bishop.\n\n## Pages\n\n- [Home](${site})\n- [About](${new URL('/about', site)})\n\n## Published posts\n\n${posts.map((post) =>
    `- [${post.title.replace(/[\r\n\[\]]/g, ' ')}](${new URL('/' + post.slug, site)}): ${post.description.replace(/[\r\n]/g, ' ')}\n`,
  ).join('')}`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
);
