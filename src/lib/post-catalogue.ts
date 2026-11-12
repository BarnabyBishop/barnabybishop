export interface SocialImage {
  url: string;
  alt: string;
  width: number;
  height: number;
}

export interface PostMetadata {
  title: string;
  description: string;
  published: string;
  modified?: string;
  image?: SocialImage;
  slug: string;
  draft: boolean;
}

export interface PostEntry extends PostMetadata {
  source: string;
}

const reserved = new Set([
  'about', '404', 'index', 'sitemap.xml', 'sitemap-index.xml',
  'robots.txt', 'llms.txt', 'rss.xml', 'feed.xml', '_astro',
]);

function validDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

/** Validate every entry, including drafts, before selecting any public content. */
export function createCatalogue(
  modules: Record<string, unknown>,
  staticPaths: string[] = [],
): PostEntry[] {
  const blocked = new Set(reserved);
  for (const path of staticPaths) {
    const normalized = path.replaceAll('\\', '/');
    const relative = normalized.split('/pages/')[1] ?? normalized.replace(/^\/+/, '');
    if (relative.includes('[')) continue;
    blocked.add(relative.replace(/\.(astro|[cm]?[jt]s)$/, '').replace(/\/index$/, '').split('/')[0]);
  }
  const slugs = new Set<string>();
  return Object.entries(modules).map(([source, value]) => {
    const fail = (message: string): never => { throw new Error(`${source}: ${message}`); };
    if (!value || typeof value !== 'object' || Array.isArray(value)) fail('metadata must be an object');
    const data = value as Record<string, unknown>;
    for (const field of ['title', 'description']) {
      if (typeof data[field] !== 'string' || !(data[field] as string).trim()) fail(`${field} must be non-empty text`);
    }
    if (!validDate(data.published)) fail('published must be a real YYYY-MM-DD date');
    if (data.modified !== undefined && !validDate(data.modified)) fail('modified must be a real YYYY-MM-DD date');
    if (typeof data.modified === 'string' && data.modified < (data.published as string)) fail('modified precedes published');
    if (typeof data.slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug)) fail('slug must be a lowercase root slug');
    if (typeof data.draft !== 'boolean') fail('draft must be explicitly true or false');
    if (data.image !== undefined) {
      const image = data.image as Partial<SocialImage> | null;
      let url: URL | undefined;
      try { url = new URL(image?.url ?? ''); } catch {}
      if (!url || !['https:', 'http:'].includes(url.protocol) || url.username || url.password) fail('image.url must be an absolute HTTP(S) URL');
      if (typeof image?.alt !== 'string' || !image.alt.trim()) fail('image.alt must be non-empty text');
      for (const dimension of ['width', 'height'] as const) {
        if (!Number.isInteger(image?.[dimension]) || (image?.[dimension] ?? 0) <= 0) fail(`image.${dimension} must be a positive integer`);
      }
    }
    const slug = data.slug as string;
    if (blocked.has(slug)) fail(`reserved/static route collision: ${slug}`);
    if (slugs.has(slug)) fail(`duplicate slug: ${slug}`);
    slugs.add(slug);
    return { ...(data as unknown as PostMetadata), source };
  }).sort((a, b) => b.published.localeCompare(a.published) || a.slug.localeCompare(b.slug));
}

export function publishedPosts(catalogue: PostEntry[]): PostEntry[] {
  return catalogue.filter((post) => !post.draft);
}

export function routablePosts(catalogue: PostEntry[], development: boolean, previewDrafts: boolean): PostEntry[] {
  return development && previewDrafts ? catalogue : publishedPosts(catalogue);
}
