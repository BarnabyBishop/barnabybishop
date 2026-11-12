import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, cp, symlink, mkdir, writeFile, readFile, rm, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn, execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createServer } from 'node:net';

const run = promisify(execFile);
const root = process.cwd();
async function port() {
  const server = createServer();
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  await new Promise<void>((resolve) => server.close(() => resolve()));
  return address.port;
}
async function serve(cwd: string, args: string[], check: (base: string) => Promise<void>, drafts = false) {
  const number = await port();
  const child = spawn(process.execPath, [join(root, 'node_modules/astro/bin/astro.mjs'), ...args, '--ignore-lock', '--host', '127.0.0.1', '--port', String(number)], {
    cwd, env: { ...process.env, PREVIEW_DRAFTS: String(drafts) }, stdio: 'pipe',
  });
  let log = '';
  child.stdout.on('data', (data) => { log += data; });
  child.stderr.on('data', (data) => { log += data; });
  const base = 'http://127.0.0.1:' + number;
  try {
    let ready = false;
    for (let attempt = 0; attempt < 150; attempt++) {
      if (child.exitCode !== null) throw new Error(log);
      try { if ((await fetch(base)).ok) { ready = true; break; } } catch {}
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    assert.ok(ready, log);
    await check(base);
  } finally {
    if (child.exitCode === null && child.signalCode === null) {
      await new Promise<void>((resolve) => {
        child.once('close', () => resolve());
        child.kill('SIGTERM');
      });
    }
  }
}

test('real static builds, direct requests and deliberate local draft preview', { timeout: 90000 }, async () => {
  const directory = await mkdtemp(join(tmpdir(), 'post-build-'));
  const build = () => run(process.execPath, [join(root, 'node_modules/astro/bin/astro.mjs'), 'build'], {
    cwd: directory, env: { ...process.env, PREVIEW_DRAFTS: 'true' }, timeout: 30000,
  });
  try {
    for (const name of ['src', 'public', 'astro.config.mjs', 'package.json', 'tsconfig.json']) {
      await cp(join(root, name), join(directory, name), { recursive: true });
    }
    await symlink(join(root, 'node_modules'), join(directory, 'node_modules'), 'dir');
    await build();
    const emptyHome = await readFile(join(directory, 'dist/index.html'), 'utf8');
    assert.match(emptyHome, /Nothing published just yet/);
    assert.doesNotMatch(emptyHome, /interactive-example|<script(?![^>]*type="application\/ld\+json")\b/);
    await assert.rejects(access(join(directory, 'dist/interactive-example/index.html')));

    // Temporary published fixtures verify both author-owned layout choices.
    for (const [slug, published, bespoke] of [
      ['older-fixture', '2025-01-01', false], ['newer-fixture', '2026-01-01', true],
    ] as const) {
      const folder = join(directory, 'src/posts', slug);
      await mkdir(folder);
      await writeFile(join(folder, 'metadata.ts'), 'export default ' + JSON.stringify({
        title: slug, description: 'Summary & details', slug, published, draft: false,
        ...(bespoke ? { modified: '2026-02-01', image: { url: 'https://barnabybishop.com/override.png', alt: 'Fixture image', width: 800, height: 400 } } : {}),
      }));
      await writeFile(join(folder, 'Post.astro'), bespoke
        ? '---\nimport SiteShell from "../../layouts/SiteShell.astro";\n---\n<SiteShell title="Bespoke fixture" description="Own layout"><main><h1>My own page</h1></main></SiteShell>'
        : '---\nimport ArticleLayout from "../../layouts/ArticleLayout.astro";\nimport metadata from "./metadata";\n---\n<ArticleLayout metadata={metadata}><p>Standard article body</p></ArticleLayout>');
    }
    const interactive = join(directory, 'src/posts/interactive-fixture');
    await mkdir(interactive);
    await writeFile(join(interactive, 'metadata.ts'), 'export default ' + JSON.stringify({
      title: 'Published interaction fixture', description: 'Test only', slug: 'interactive-fixture',
      published: '2024-01-01', draft: false,
    }));
    await cp(join(directory, 'src/posts/interactive-example/Post.astro'), join(interactive, 'Post.astro'));
    await cp(join(directory, 'public/social.png'), join(directory, 'public/override.png'));
    await build();
    const interactiveHtml = await readFile(join(directory, 'dist/interactive-fixture/index.html'), 'utf8');
    assert.match(interactiveHtml, /<script(?![^>]*type="application\/ld\+json")\b/);
    const home = await readFile(join(directory, 'dist/index.html'), 'utf8');
    assert.ok(home.indexOf('href="/newer-fixture"') < home.indexOf('href="/older-fixture"'));
    for (const file of ['index.html', 'about/index.html', '404.html', 'rss.xml', 'sitemap.xml', 'llms.txt']) {
      const output = await readFile(join(directory, 'dist', file), 'utf8');
      assert.doesNotMatch(output, /interactive-example|A small interactive example/);
      assert.doesNotMatch(output, /<script(?![^>]*type="application\/ld\+json")\b/);
    }
    const titles = new Set<string>();
    for (const [file, path, article] of [
      ['index.html', '/', false], ['about/index.html', '/about', false],
      ['older-fixture/index.html', '/older-fixture', true], ['newer-fixture/index.html', '/newer-fixture', true],
    ] as const) {
      const html = await readFile(join(directory, 'dist', file), 'utf8');
      const url = 'https://barnabybishop.com' + path;
      assert.match(html, new RegExp(`<link rel="canonical" href="${url}"`));
      assert.match(html, new RegExp(`<meta property="og:url" content="${url}"`));
      assert.match(html, new RegExp(`<meta property="og:type" content="${article ? 'article' : 'website'}"`));
      assert.match(html, /<html lang="en"/);
      assert.match(html, /name="viewport"/);
      assert.match(html, /name="theme-color" content="#fffaf0"/);
      assert.match(html, /property="og:site_name" content="Barnaby Bishop"/);
      assert.match(html, /name="twitter:card" content="summary_large_image"/);
      assert.match(html, /type="application\/rss\+xml"[^>]*href="https:\/\/barnabybishop.com\/rss.xml"/);
      assert.doesNotMatch(html, /localhost|127\.0\.0\.1/);
      const title = html.match(/<title>(.*?)<\/title>/)![1]!;
      assert.ok(!titles.has(title));
      titles.add(title);
      const graph = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)![1]!)['@graph'];
      assert.equal(graph[0].name, 'Barnaby Bishop');
      assert.equal(graph[1].url, 'https://barnabybishop.com/');
      assert.equal(graph.some((entry: { '@type': string }) => entry['@type'] === 'BlogPosting'), article);
      if (article) {
        assert.match(html, /property="article:author" content="https:\/\/barnabybishop.com\/"/);
        assert.equal(graph[2].url, url);
        assert.equal(graph[2].headline, path.slice(1));
      }
      if (path === '/newer-fixture') {
        assert.match(html, /property="og:image" content="https:\/\/barnabybishop.com\/override.png"/);
        assert.match(html, /property="og:image:alt" content="Fixture image"/);
        assert.match(html, /property="og:image:width" content="800"/);
        assert.match(html, /property="og:image:height" content="400"/);
        assert.match(html, /property="article:modified_time" content="2026-02-01"/);
        assert.equal(graph[2].dateModified, '2026-02-01');
      } else {
        assert.match(html, /property="og:image" content="https:\/\/barnabybishop.com\/social.png"/);
        assert.doesNotMatch(html, /article:modified_time|dateModified/);
      }
    }
    const notFound = await readFile(join(directory, 'dist/404.html'), 'utf8');
    assert.match(notFound, /noindex, nofollow/);
    const sitemap = await readFile(join(directory, 'dist/sitemap.xml'), 'utf8');
    const llms = await readFile(join(directory, 'dist/llms.txt'), 'utf8');
    for (const slug of ['older-fixture', 'newer-fixture', 'interactive-fixture']) {
      const url = 'https://barnabybishop.com/' + slug;
      assert.ok(sitemap.includes(`<loc>${url}</loc>`));
      assert.ok(llms.includes(`](${url})`));
    }
    assert.match(await readFile(join(directory, 'dist/robots.txt'), 'utf8'), /Sitemap: https:\/\/barnabybishop.com\/sitemap.xml/);
    for (const asset of ['social.png', 'favicon-32.png', 'apple-touch-icon.png', 'override.png']) {
      const bytes = await readFile(join(directory, 'dist', asset));
      assert.equal(bytes.subarray(1, 4).toString(), 'PNG');
      if (asset === 'social.png') {
        assert.equal(bytes.readUInt32BE(16), 1200);
        assert.equal(bytes.readUInt32BE(20), 630);
      }
    }
    const rss = await readFile(join(directory, 'dist/rss.xml'), 'utf8');
    assert.doesNotMatch(sitemap + rss + llms, /404|interactive-example/);
    assert.match(rss, /<link>https:\/\/barnabybishop.com\/newer-fixture<\/link>/);
    assert.match(rss, /Summary &amp; details/);
    assert.ok(rss.indexOf('newer-fixture') < rss.indexOf('older-fixture'));
    await serve(directory, ['preview'], async (base) => {
      for (const path of ['/', '/about', '/older-fixture', '/newer-fixture', '/rss.xml', '/sitemap.xml', '/robots.txt', '/llms.txt']) {
        assert.equal((await fetch(base + path)).status, 200, path);
      }
      assert.equal((await fetch(base + '/interactive-example')).status, 404);
      assert.equal((await fetch(base + '/does-not-exist')).status, 404);
      assert.match(await (await fetch(base + '/does-not-exist')).text(), /Nothing here/);
      const standard = await (await fetch(base + '/older-fixture')).text();
      assert.match(standard, /site-header/);
      assert.match(standard, /Standard article body/);
      assert.doesNotMatch(standard, /<script(?![^>]*type="application\/ld\+json")\b/);
      const bespoke = await (await fetch(base + '/newer-fixture')).text();
      assert.match(bespoke, /My own page/);
      assert.doesNotMatch(bespoke, /class="site-(?:header|footer)"|<article\b|<script(?![^>]*type="application\/ld\+json")\b/);
    });
    await serve(directory, ['dev'], async (base) => {
      assert.equal((await fetch(base + '/interactive-example')).status, 404);
    });
    await serve(directory, ['dev'], async (base) => {
      const response = await fetch(base + '/interactive-example');
      assert.equal(response.status, 200);
      const html = await response.text();
      assert.match(html, /noindex, nofollow/);
      assert.match(html, /Start with something small enough to try/);
      assert.match(html, /aria-live="polite"/);
      assert.match(html, /Post.astro\?astro&type=script/);
      for (const path of ['/', '/rss.xml', '/sitemap.xml', '/llms.txt']) {
        assert.doesNotMatch(await (await fetch(base + path)).text(), /href="\/interactive-example"|A small interactive example|<loc>[^<]*interactive-example|<link>[^<]*interactive-example/);
      }
    }, true);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
