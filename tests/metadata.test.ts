import { test } from 'node:test';
import assert from 'node:assert/strict';
import { canonicalUrl, pageMetadata, serializeJsonLd } from '../src/lib/metadata.ts';
import { createCatalogue } from '../src/lib/post-catalogue.ts';

const post = { title: 'A title', description: 'A summary', published: '2026-01-01', slug: 'a-post', draft: false };

test('canonical production URLs ignore query strings, fragments, request origins and trailing slashes', () => {
  for (const path of ['/about', '/about/', '/about///?x=1#top', 'http://localhost:4321/about/']) {
    assert.equal(canonicalUrl(path), 'https://barnabybishop.com/about');
  }
  assert.equal(canonicalUrl('/'), 'https://barnabybishop.com/');
});

test('draft previews have no article metadata or structured data; modification dates are never fabricated', () => {
  const draft = pageMetadata('/a-post', { ...post, draft: true });
  assert.equal(draft.noindex, true);
  assert.equal(draft.type, 'website');
  assert.deepEqual(draft.structuredData, []);
  const published = pageMetadata('/a-post', post);
  assert.equal(published.type, 'article');
  assert.equal(published.modified, undefined);
  assert.doesNotMatch(serializeJsonLd(published.structuredData), /dateModified/);
});

test('social overrides require absolute HTTP(S) URLs, descriptive alt text and real dimensions', () => {
  const image = { url: 'https://example.com/card.png', alt: 'A card', width: 1200, height: 630 };
  assert.equal(pageMetadata('/a-post', { ...post, image }).image, image);
  for (const change of [{ url: '/relative.png' }, { url: 'javascript:alert(1)' }, { alt: '' }, { width: 0 }, { height: 1.5 }]) {
    assert.throws(() => createCatalogue({ fixture: { ...post, image: { ...image, ...change } } }), /image\./);
  }
});

test('JSON-LD remains inert with HTML or closing script text from the catalogue', () => {
  const value = { text: '</script><script>alert("test")</script> & text' };
  const serialized = serializeJsonLd(value);
  assert.doesNotMatch(serialized, /[<>&]/);
  assert.deepEqual(JSON.parse(serialized), value);
});
