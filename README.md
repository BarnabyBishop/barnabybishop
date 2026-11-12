# BarnabyBishop

Styles use one declaration per line, with a blank line between rules.

- `src/styles/global.css` owns design tokens, resets, base element styles and classes shared across pages, such as `.reading`, `.scaffold`, `.tactile` and `.eyebrow`. It also declares the shared CSS layer order.
- Astro components and layouts own their scoped styles. Header navigation and skip-link styles live in `SiteHeader.astro`; footer styles live in `SiteFooter.astro`; article typography lives in `ArticleLayout.astro`.
- Page-specific styles stay in the page's `<style>` block, grouped by section with interaction and responsive rules nearby.
- Use `:global()` only where a scoped wrapper needs to style slotted content, as with article prose. Keep the wrapper scoped so those rules stay inside the layout.
