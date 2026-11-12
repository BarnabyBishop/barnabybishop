import type { PostMetadata, SocialImage } from './post-catalogue';

export const origin = 'https://barnabybishop.com';
export const siteName = 'Barnaby Bishop';
export const siteDescription = 'The personal website of Barnaby Bishop.';
export const themeColour = '#fffaf0';

/** Page paths have no trailing slash, except the site root. Never use request origins. */
export function canonicalUrl(path: string): string {
  const pathname = new URL(path, origin).pathname.replace(/\/+$/, '') || '/';
  return origin + pathname;
}

export const defaultImage: SocialImage = {
  url: origin + '/social.png',
  alt: 'Barnaby Bishop with pastel Memphis shapes, dark outlines and hard shadows.',
  width: 1200,
  height: 630,
};

export const publicPages = [
  { path: '/', title: siteName, description: siteDescription },
  { path: '/about', title: 'About — Barnaby Bishop', description: 'About page for Barnaby Bishop.' },
] as const;

export interface PageMetadata {
  title: string;
  description: string;
  canonical: string;
  image: SocialImage;
  type: 'website' | 'article';
  noindex: boolean;
  published?: string;
  modified?: string;
  structuredData: Record<string, unknown>[];
}

export function pageMetadata(path: string, post?: PostMetadata, fallback?: { title?: string; description?: string; noindex?: boolean }): PageMetadata {
  const canonical = canonicalUrl(path);
  const page = publicPages.find((entry) => canonicalUrl(entry.path) === canonical);
  const missing = canonical === canonicalUrl('/404') || canonical === canonicalUrl('/404.html');
  const title = post ? `${post.title} — ${siteName}` : page?.title ?? fallback?.title ?? `Page not found — ${siteName}`;
  const description = post?.description ?? page?.description ?? fallback?.description ?? 'This page could not be found.';
  const article = post && !post.draft;
  const image = post?.image ?? defaultImage;
  const person = { '@type': 'Person', '@id': origin + '/#person', name: siteName, url: canonicalUrl('/') };
  const website = { '@type': 'WebSite', '@id': origin + '/#website', name: siteName, url: canonicalUrl('/'), description: siteDescription, author: { '@id': person['@id'] } };
  const noindex = missing || post?.draft === true || fallback?.noindex === true;
  return {
    title, description, canonical, image, noindex, type: article ? 'article' : 'website',
    ...(article ? { published: post.published, modified: post.modified } : {}),
    structuredData: noindex ? [] : [{ '@context': 'https://schema.org', '@graph': [person, website, ...(article ? [{
      '@type': 'BlogPosting', '@id': canonical + '#article', url: canonical,
      mainEntityOfPage: canonical, headline: post.title, description,
      image: { '@type': 'ImageObject', url: image.url, caption: image.alt, width: image.width, height: image.height },
      author: { '@id': person['@id'] }, isPartOf: { '@id': website['@id'] },
      datePublished: post.published, ...(post.modified ? { dateModified: post.modified } : {}),
    }] : [])] }],
  };
}

/** Keep JSON-LD inert even when catalogue text contains HTML closing tags. */
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
}
