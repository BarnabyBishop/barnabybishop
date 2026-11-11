import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import { createCatalogue, publishedPosts, routablePosts } from './post-catalogue';

const metadata = import.meta.glob('../posts/*/metadata.ts', {
  eager: true,
  import: 'default',
});
const components = import.meta.glob<{ default: AstroComponentFactory }>('../posts/*/Post.astro');
const pages = Object.keys(import.meta.glob('../pages/**/*.{astro,ts,js}'));
const publicFiles = Object.keys(import.meta.glob('../../public/**/*')).map((path) => path.split('/public/')[1]!);
export const catalogue = createCatalogue(metadata, [...pages, ...publicFiles]);

for (const post of catalogue) {
  if (!components[post.source.replace('/metadata.ts', '/Post.astro')]) {
    throw new Error(`${post.source}: missing sibling Post.astro`);
  }
}
for (const source of Object.keys(components)) {
  if (!metadata[source.replace('/Post.astro', '/metadata.ts')]) {
    throw new Error(`${source}: missing sibling metadata.ts`);
  }
}

export const posts = publishedPosts(catalogue);
export const routes = routablePosts(catalogue, import.meta.env.DEV, import.meta.env.PREVIEW_DRAFTS === 'true');
export function loadPost(source: string) {
  return components[source.replace('/metadata.ts', '/Post.astro')]!();
}
