# CurtisAube.com

Build from [Astro Wanderer](https://github.com/igagansingh/astro-wanderer)

## Project structure

```
├── public/
│   └── img/              # avatar, og image, trip photos
├── src/
│   ├── components/       # Header, Hero, Gallery, PostCard, …
│   ├── content/
│   │   ├── blog/         # markdown posts
│   │   └── trips/        # markdown trip stories
│   ├── data/
│   │   ├── site.ts       # ← edit this first
│   │   └── resume.ts     # experience, education, skills, typing roles
│   ├── pages/            # index, work, blog, travel, 404, rss
│   └── styles/global.css # design tokens + all styling (no framework)
└── astro.config.mjs      # set your production URL here
```

## Writing content

### Blog post

Create a markdown file in `src/content/blog/`:

```md
---
title: My first post
subtitle: An optional subtitle
date: 2026-01-15
tags: [notes]
category: tech        # or life
description: One-liner for cards and SEO.
coverImage: /img/blog/my-first-post.jpg
draft: false          # true hides the post from builds
---

Your words here.
```

Place blog hero images in `public/img/blog/` and reference them with a root-relative
`coverImage` path. The image appears on the blog cards, at the top of the post, and
in social/structured-data metadata.

### Trip entry

Create a markdown file in `src/content/trips/`, drop photos into `public/img/trips/<trip>/`, and list them:

```md
---
title: Kyoto, 2026
place: Kyoto, Japan
date: 2026-04-10
summary: One line for the card.
heroImage: /img/trips/kyoto/hero.jpg
circlePhotos:                 # photos for the rotating ring
  - /img/trips/kyoto/torii.jpg
gallery:
  - /img/trips/kyoto/hero.jpg
highlights:
  - Fushimi Inari at sunrise
---

Story body here.
```

Photos in `gallery` get a carousel with a click-to-open lightbox, thumbnail strip, fullscreen mode, and arrow-key navigation. `.mp4`/`.webm` files are supported alongside images.

## Customization checklist

1. `src/data/site.ts` — name, description, URL, socials
2. `src/data/resume.ts` — roles, education, skills, hero typing words
3. `public/img/avatar.svg` → your photo · `public/img/og.jpg` → a 1200×630 share card
4. `astro.config.mjs` — set `site` to your production URL, and set (or remove) `base`
5. Write real content, then delete the two sample posts and sample trip

## Deploy

The included `.github/workflows/deploy.yml` builds and deploys to GitHub Pages on every push to `main`. In your repo settings, set **Settings → Pages → Source** to **GitHub Actions**.

### Hosting at a subpath (e.g. `username.github.io/my-repo`)

Keep `base: '/my-repo'` in `astro.config.mjs`. All internal links and assets are routed through a single `withBase()` helper, so everything just works. The deploy workflow automatically nests the build output under your base path so GitHub Pages resolves it. This is how the [live demo](https://igagansingh.com/astro-wanderer) is hosted.

### Hosting at the domain root (`example.com`)

Remove the `base` line from `astro.config.mjs`. The workflow detects this and ships the output un-nested.

Any static host works too — Netlify, Vercel, Cloudflare Pages — just point the build command at `npm run build` with output `dist/`.

## Commands

| Command           | Action                                    |
| :---------------- | :---------------------------------------- |
| `npm run dev`     | Start local dev server                    |
| `npm run build`   | Production build to `./dist/`             |
| `npm run preview` | Preview the production build locally      |
| `npm run check`   | Type-check the project                    |

## License

MIT — free for personal and commercial use. If it saved you an afternoon, a star or a link back is always appreciated.
