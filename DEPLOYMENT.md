# Deployment

Static Astro site for https://barnabybishop.com. Use Node **26.13.1**
(`nvm use`) and Corepack with **pnpm 12.18.0**, pinned in `package.json`.
Run `pnpm install --frozen-lockfile`, `pnpm check`, `pnpm test`, then
`pnpm build`. `pnpm preview` serves the built `dist` locally through Wrangler;
`pnpm dev` is the Astro authoring server.

## Cloudflare operations

Repository configuration is ready for Workers Static Assets. Cloudflare account
access was unavailable during setup (`wrangler whoami`: unauthenticated), so the
Git connection, remote build settings and custom domain are **not verified or
configured by this PR**. No remote deployment or live-site cutover was performed.

After merging, Barney must configure [native Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/):

1. In Cloudflare **Workers & Pages**, create/select the **Worker** `barnabybishop`.
   Check for an existing Worker/domain binding before deploying under that name.
   Connect GitHub and authorize the Cloudflare GitHub app for
   `BarnabyBishop/barnabybishop`; choose this repository, production branch `main`,
   repository root `/`. Connecting may trigger the first deployment: keep the
   existing production domain detached from this Worker until cutover is intended.
2. Under **Settings > Build**, set the build command to
   `pnpm install --frozen-lockfile && pnpm check && pnpm test && pnpm build`
   and deploy command to `pnpm exec wrangler deploy`. Set build variable
   `SKIP_DEPENDENCY_INSTALL=1` so the explicit frozen install is authoritative.
   `.nvmrc` selects Node 26.13.1 and `packageManager` selects pnpm 12.18.0;
   remove conflicting version overrides. Use Cloudflare's generated build token
   for this account. Do not set `PREVIEW_DRAFTS`.
3. Disable non-production branch/preview builds (only `main` builds/deploys).
   Keep workers.dev and version URLs disabled, as in `wrangler.jsonc`.
   No GitHub Actions workflow is needed. Confirm the first build logs show the
   pinned versions, frozen install, passing checks/tests/build and successful
   static-asset deployment. Verify the deployed commit SHA matches merged `main`.
4. **Explicit live-site cutover:** first record the current hosting target, DNS
   records, any existing Worker routes/custom-domain ownership and rollback steps.
   Keep the existing site running until ready. Ensure `barnabybishop.com` is an
   active Cloudflare zone in this account; if moving DNS, preserve all other
   records and complete nameserver activation before the hosting cutover. At the
   agreed cutover, remove any conflicting apex hosting/Worker binding and add
   `barnabybishop.com` in **Worker > Settings > Domains & Routes > Add > Custom
   Domain**. Cloudflare provisions the DNS record and certificate; confirm both
   become active. The domain is deliberately absent from Wrangler to prevent
   config validation or an initial deploy from taking over the existing site.
5. Verify HTTPS `/`, `/about`, a published root post when available, nested missing
   URLs (404 with the custom body), `/robots.txt`, `/sitemap.xml`, `/rss.xml`,
   `/llms.txt`, and social/icon assets on the **production domain**. Confirm
   canonicals use `https://barnabybishop.com`, drafts are absent, and the deployed
   content matches the merged commit before declaring cutover complete. If it
   fails, detach the new custom domain and restore the recorded old hosting/DNS
   configuration; retain the old host until validation is complete. Later Worker
   rollbacks use the previously verified deployment.

Routing is asset-only (`drop-trailing-slash`, `404-page`), with no Worker entrypoint
or SSR adapter. Local validation and `pnpm exec wrangler deploy --dry-run` do not
publish. Avoid running `pnpm run deploy` until the target account/Worker is confirmed.
