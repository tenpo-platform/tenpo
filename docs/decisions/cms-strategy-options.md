# CMS Strategy Options for Tenpo

> Comparison of three approaches for managing marketing content alongside the core marketplace app.

---

## The Problem

Tenpo needs:
1. **Marketing pages** — Homepage, About, For Camps, For Parents, Blog, etc.
2. **App pages** — Camp browsing, checkout, dashboards (parent + organizer)

The app pages are built with Next.js + Supabase. The question is: how do we handle marketing pages, and who can edit them?

**Key tension:** Non-technical cofounder wants to edit marketing content without needing a developer. But adding a CMS adds complexity.

---

## Three Options

| Option | Summary | Who edits marketing |
|--------|---------|---------------------|
| **A: No CMS** | Everything in code | Developer only |
| **B: Hosted CMS** | Contentful, Sanity, etc. | Cofounder via external dashboard |
| **C: Self-hosted CMS** | Payload in same codebase | Cofounder via `/admin` |

---

## Option A: No CMS (Developer Controls Everything)

### How it works

Marketing pages are React components with hardcoded content:

```tsx
// app/(marketing)/about/page.tsx
export default function AboutPage() {
  return (
    <main>
      <HeroSection
        title="Our Story"
        subtitle="We started Tenpo because finding sports camps shouldn't be hard."
      />
      <FeatureGrid features={[
        { title: "For Parents", description: "Find the perfect camp" },
        { title: "For Camps", description: "Reach more families" },
      ]} />
    </main>
  )
}
```

### Architecture

```
jointenpo.com/
├── (marketing)/          ← Hardcoded React pages
│   ├── page.tsx              (home)
│   ├── about/page.tsx
│   ├── for-camps/page.tsx
│   └── blog/[slug]/page.tsx  (could pull from Supabase if needed)
├── (app)/                ← Supabase-powered app
│   ├── camps/
│   ├── dashboard/
│   └── organizer/
└── No CMS involved
```

### Pros

| Benefit | Details |
|---------|---------|
| **Simplest architecture** | No CMS integration, no extra dependencies |
| **Fastest to build** | Just write React components |
| **Zero cost** | No CMS subscription |
| **Best performance** | Fully static, no data fetching |
| **Full control** | No constraints from CMS data models |
| **Type safety** | Everything is TypeScript |
| **Single deployment** | Just your Next.js app |

### Cons

| Drawback | Details |
|----------|---------|
| **Developer bottleneck** | Every content change requires dev work |
| **Deploy for typos** | "Change this headline" = commit + deploy |
| **Cofounder friction** | Must ask dev, wait for availability |
| **Doesn't scale** | Manageable for 5 pages, painful for 50 |

### Workflow

```
Cofounder: "Can you change the homepage headline to X?"
Developer: Opens VS Code, edits string, commits, deploys
Time: 5 minutes if available, hours/days if busy
```

### Best for

- Early stage, moving fast
- Marketing pages are relatively stable
- Developer is available for quick changes
- Want to defer CMS complexity

---

## Option B: Hosted CMS (Contentful, Sanity, Storyblok)

### How it works

Marketing content lives in a third-party CMS. Your Next.js app fetches it at build/request time.

```tsx
// app/(marketing)/about/page.tsx
import { getPage } from '@/lib/sanity'

export default async function AboutPage() {
  const page = await getPage('about')

  return (
    <main>
      <HeroSection title={page.heroTitle} subtitle={page.heroSubtitle} />
      {page.blocks.map(block => renderBlock(block))}
    </main>
  )
}
```

### Architecture

```
┌─────────────────────────────────┐     ┌─────────────────────────┐
│  jointenpo.com (Your Next.js)   │     │  sanity.io / contentful │
│                                 │     │  (External service)     │
│  Marketing pages ◄──────────────┼─────┤  Cofounder edits here   │
│  fetch content from CMS         │ API │  Content stored here    │
│                                 │     │                         │
│  App pages use Supabase         │     │  Separate login         │
└─────────────────────────────────┘     └─────────────────────────┘
```

### Popular options

| CMS | Pricing | Editor UX | Best for |
|-----|---------|-----------|----------|
| **Sanity** | Free tier, then ~$99/mo | Customizable Studio | Developer flexibility |
| **Contentful** | Free tier (5 users), then ~$300/mo | Polished web UI | Structured content |
| **Storyblok** | Free tier, then ~$100/mo | Visual page builder | Non-technical editors |
| **Prismic** | Free tier, then ~$100/mo | Slice-based editor | Simple marketing sites |

### Pros

| Benefit | Details |
|---------|---------|
| **Cofounder independence** | Full self-service content editing |
| **Excellent editor UX** | Purpose-built for content editing |
| **Managed infrastructure** | They handle uptime, backups, scaling |
| **Built-in features** | Preview, drafts, scheduling, versioning |
| **CDN/caching** | Content delivered fast globally |
| **No database load** | Content stored separately |

### Cons

| Drawback | Details |
|----------|---------|
| **Monthly cost** | $100-500/mo beyond free tier |
| **External dependency** | Marketing pages depend on their uptime |
| **Vendor lock-in** | Content model tied to their structure |
| **API latency** | Extra network hop (mitigated by caching) |
| **Two systems** | Cofounder uses CMS, dev uses Supabase |
| **Integration work** | Need to build connection, handle types |

### Workflow

```
Cofounder: Logs into sanity.io or contentful.com
           Edits page content in their dashboard
           Hits publish
           Changes live in ~1 minute (webhook triggers rebuild)
Developer: Not involved
```

### Best for

- Active content marketing (weekly blog posts, landing page experiments)
- Non-technical editor needs great UX
- Okay with external dependency and cost
- Want to get cofounder unblocked quickly

---

## Option C: Self-hosted CMS (Payload)

### How it works

Payload CMS installs directly into your Next.js app. Admin panel at `/admin`, content stored in your Supabase Postgres database.

```tsx
// app/(marketing)/about/page.tsx
import { getPayload } from 'payload'
import config from '@/payload.config'

export default async function AboutPage() {
  const payload = await getPayload({ config })
  const page = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'about' } }
  })

  return (
    <main>
      <HeroSection title={page.heroTitle} subtitle={page.heroSubtitle} />
      {page.blocks.map(block => renderBlock(block))}
    </main>
  )
}
```

### Architecture

```
jointenpo.com/
├── (marketing)/          ← Pages fetch from Payload
│   ├── page.tsx
│   ├── about/page.tsx
│   └── blog/[slug]/page.tsx
├── (app)/                ← Pages fetch from Supabase
│   ├── camps/
│   ├── dashboard/
│   └── organizer/
├── (payload)/            ← Payload admin panel
│   └── admin/[[...segments]]/page.tsx
├── payload.config.ts     ← Content model definition
├── collections/          ← Page, Post, Media schemas
└── All in one codebase, one database, one deployment
```

### Pros

| Benefit | Details |
|---------|---------|
| **Full ownership** | Open source, self-hosted, no vendor |
| **Zero subscription cost** | Just your existing hosting |
| **Same database** | CMS content in Supabase Postgres |
| **Single deployment** | Everything deploys together |
| **Admin at your domain** | Cofounder logs into jointenpo.com/admin |
| **Type safety** | Auto-generated TypeScript types |
| **Customizable** | Full control over admin panel |
| **No external dependency** | Your uptime, your control |

### Cons

| Drawback | Details |
|----------|---------|
| **More setup work** | Need to configure Payload, define schemas |
| **Learning curve** | New system for both dev and cofounder |
| **You maintain it** | Updates, migrations are your responsibility |
| **Database complexity** | CMS tables alongside app tables |
| **Editor UX** | Good but not as polished as purpose-built SaaS |

### Workflow

```
Cofounder: Goes to jointenpo.com/admin
           Logs in (Payload's own auth)
           Edits page content
           Hits publish
           Changes live immediately
Developer: Not involved for content; handles code/schema changes
```

### Best for

- Want full ownership and control
- Avoiding vendor lock-in and recurring costs
- Comfortable with more upfront setup
- Building for the long term

---

## Side-by-side comparison

| Aspect | No CMS | Hosted CMS | Self-hosted (Payload) |
|--------|--------|------------|----------------------|
| **Setup time** | None | Medium | Medium-High |
| **Monthly cost** | $0 | $100-500+ | $0 |
| **Cofounder can edit** | No | Yes | Yes |
| **Dev needed for changes** | Always | Never | Never (for content) |
| **Content location** | Your repo | Their servers | Your database |
| **Vendor lock-in** | None | Medium | None |
| **External dependency** | None | Yes | None |
| **Editor experience** | N/A | Excellent | Good |
| **Type safety** | Perfect | Requires setup | Built-in |
| **Performance** | Best | Good | Good |
| **Long-term cost** | Lowest | Highest | Lowest |
| **Long-term control** | Full | Limited | Full |

---

## SEO Considerations

### Why Webflow/Framer aren't options (and their SEO tradeoff)

We can't use Webflow or Framer because our design system (fonts, colors, components) lives in the React codebase. These tools can't import our components — we'd have to rebuild everything from scratch and maintain two versions.

But even if we could, there's an SEO problem:

```
Webflow/Framer setup:
jointenpo.com         → Webflow (marketing)
app.jointenpo.com     → Next.js (app)

Problem: Domain authority splits between subdomains.
```

Google treats subdomains as partially separate sites. Backlinks to the marketing site don't fully benefit the app subdomain where camp listings live — and those are the pages that need to rank for "soccer camps near me."

**You'd be building SEO juice on the wrong domain.**

### SEO by option

| Option | SEO Score | Notes |
|--------|-----------|-------|
| **Webflow/Framer** | 6/10 | Good built-in tools, but subdomain splits authority |
| **Hosted CMS + Next.js** | 9/10 | Same domain, full control, SSR/SSG |
| **Payload + Next.js** | 10/10 | Same domain, full control, fastest |
| **Hardcoded + Next.js** | 10/10 | Same domain, full control, fully static |

### Why same domain matters

```
Everything on one domain:
──────────────────────────────────────
jointenpo.com/          ← Backlinks land here
jointenpo.com/about     ← Marketing pages
jointenpo.com/camps     ← Camp listings (need to rank!)
jointenpo.com/blog      ← Content marketing

All authority stays unified.
Camp pages benefit from every backlink to the site.
```

### What actually matters for Tenpo's SEO

| Page type | SEO importance | Where it lives |
|-----------|---------------|----------------|
| Marketing (About, For Camps) | Low | Branded searches, you'll rank anyway |
| Camp listings (/camps/*) | **High** | Competitive keywords like "soccer camps chicago" |
| Blog | Medium-High | Content marketing, long-tail keywords |

The camp pages are where SEO matters most — and those are always in Next.js with Supabase data regardless of CMS choice. The CMS decision mainly affects marketing pages, which have lower SEO stakes.

### Bottom line

The CMS choice (hosted vs Payload vs hardcoded) doesn't affect SEO much since they all render through Next.js. **The domain structure is what matters.** Same domain = good. Subdomain split = leaving SEO value on the table.

All three recommended options (No CMS, Hosted CMS, Payload) keep everything on one domain with full Next.js SEO capabilities.

---

## Decision framework

```
Are marketing pages changing frequently?
├── No → Option A (No CMS) - defer the complexity
└── Yes
    └── Do you want to pay a monthly fee?
        ├── Yes, want best editor UX → Option B (Hosted CMS)
        └── No, want full ownership → Option C (Payload)
```

---

## Recommended approach

**Start with Option A (No CMS), migrate to Option C (Payload) when needed.**

### Why this path

1. **No premature optimization** — You don't know how often content will change until you're live
2. **Ship faster** — No CMS setup delays your launch
3. **Zero cost** — Pay no one, own everything
4. **Clean migration path** — Adding Payload later doesn't require restructuring
5. **Modern philosophy** — Build it yourself, maintain control

### Timeline

```
Phase 1 (Launch): No CMS
                  Hardcode marketing pages
                  Focus on core marketplace
                  Cofounder requests changes through dev

Phase 2 (When needed): Add Payload
                       If content changes frequently
                       If cofounder is blocked
                       If blog/SEO becomes priority
```

### When to trigger Phase 2

- Cofounder is requesting content changes weekly
- Dev is annoyed at being bottleneck for copy changes
- Blog/SEO content strategy is active
- Marketing page experiments are happening

---

## Summary

| Option | Verdict |
|--------|---------|
| **No CMS** | Start here. Simplest, fastest, free. |
| **Hosted CMS** | Skip. Paying for something you can own. |
| **Self-hosted CMS** | Add when needed. Full control, zero recurring cost. |

The new age of tech: **build everything yourself, pay no one.**
