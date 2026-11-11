import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createCatalogue, publishedPosts, routablePosts } from '../src/lib/post-catalogue.ts';

const valid = { title: 'A title', description: 'A summary', published: '2026-01-01', slug: 'a-post', draft: false };
test('validates required metadata, dates and root slugs, including drafts', () => {
  for (const change of [
    { title: '' }, { description: ' ' }, { published: '2026-02-30' }, { published: 'yesterday' },
    { modified: '2025-01-01' }, { modified: '2026-13-01' }, { slug: 'About' },
    { slug: '../escape' }, { slug: 'two/levels' }, { draft: undefined }, { draft: 'false' },
  ]) {
    assert.throws(() => createCatalogue({ example: { ...valid, ...change } }), /example:/);
  }
  assert.throws(() => createCatalogue({ draft: { ...valid, draft: true, title: '' } }), /title/);
  assert.throws(() => createCatalogue({ example: null }), /metadata/);
  assert.equal(createCatalogue({ example: { ...valid, modified: '2026-01-02' } }).length, 1);
});

test('rejects duplicates even when one entry is a draft', () => {
  assert.throws(() => createCatalogue({ a: valid, b: { ...valid, draft: true } }), /duplicate slug/);
});
test('rejects reserved and discovered static/public paths', () => {
  for (const slug of ['about', '404', 'index', 'sitemap-index']) {
    assert.throws(() => createCatalogue({ a: { ...valid, slug } }, ['../pages/sitemap-index.astro']), /collision/);
  }
  for (const path of ['../pages/contact.astro', '../pages/contact/index.astro', 'contact', 'contact/logo.svg']) {
    assert.throws(() => createCatalogue({ a: { ...valid, slug: 'contact' } }, [path]), /collision/);
  }
  // Discovery endpoints cannot be represented by valid post slugs.
  for (const slug of ['rss.xml', 'sitemap.xml', 'robots.txt', 'llms.txt']) {
    assert.throws(() => createCatalogue({ a: { ...valid, slug } }));
  }
});
test('one catalogue sorts newest first and never publishes drafts, even with production preview flag', () => {
  const entries = createCatalogue({
    a: valid,
    b: { ...valid, slug: 'latest', published: '2026-03-01' },
    c: { ...valid, slug: 'secret', published: '2026-04-01', draft: true },
    d: { ...valid, slug: 'another', published: '2026-03-01' },
  });
  assert.deepEqual(publishedPosts(entries).map((post) => post.slug), ['another', 'latest', 'a-post']);
  assert.deepEqual(routablePosts(entries, false, true), publishedPosts(entries));
  assert.deepEqual(routablePosts(entries, true, false), publishedPosts(entries));
  assert.equal(routablePosts(entries, true, true).length, 4);
});
