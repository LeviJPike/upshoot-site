# Upshoot Collective — website

Static site. No build step, no dependencies, no npm. Open `index.html` in a
browser and it works. That's deliberate: you can edit any of this a year from
now without reinstalling a toolchain.

```
index.html          Home
eminence.html       Eminence (the individual offer)
assets/css/style.css    All styling. Palette is at the very top.
assets/js/main.js       The stem, count-ups, reveals. ~250 lines, commented.
assets/img/             Logo, favicon, social image, client logos
CNAME               Tells GitHub Pages to serve upshootcollective.com
```

---

## The idea

The site is built around one concept: **the stem**. A single line of growth is
drawn down the page as you scroll and sprouts a leaf at every section — the
logo's leaf, reused. The pricing tiers physically climb: Roots sits lowest,
Reach highest. The whole page performs "new growth that breaks upward" rather
than just saying it.

---

## Getting it live

### 1. Put it on GitHub

```bash
cd upshoot-site
git init
git add .
git commit -m "Upshoot Collective website"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/upshoot-site.git
git push -u origin main
```

### 2. Turn on Pages

In the repo: **Settings → Pages → Source: Deploy from a branch → `main` / `root`
→ Save.**

### 3. Point the domain at it

At your domain registrar, add these DNS records for `upshootcollective.com`:

| Type  | Name  | Value                  |
|-------|-------|------------------------|
| A     | @     | `185.199.108.153`      |
| A     | @     | `185.199.109.153`      |
| A     | @     | `185.199.110.153`      |
| A     | @     | `185.199.111.153`      |
| CNAME | www   | `YOUR-USERNAME.github.io` |

Back in **Settings → Pages**, put `upshootcollective.com` in Custom domain and
tick **Enforce HTTPS** once the certificate has been issued (can take an hour).

DNS can take up to 24 hours to propagate. It's usually much faster.

---

## Things you'll want to change

### The booking link

Every "Book a call" button currently opens the visitor's email app with the
questions pre-filled — no signup needed, works today, and you get the answers
before the call.

When you have a Cal.com or Calendly link, search both HTML files for
`data-book` and replace each `href="mailto:..."` with your booking URL. There
are three in `index.html` and three in `eminence.html`.

### Prices

Search for `£229`, `£349`, `£499` in `index.html` and `£219` in
`eminence.html`. They also appear in the hero note and the meta description
near the top of each file.

### Client logos

`assets/img/clients/`. The four logos have been redrawn as single-colour
Upshoot-ink silhouettes so the row reads as one system instead of four
clashing brand palettes.

To add a fifth, copy an `<li class="client">` block in `index.html` and set
`--h` to optically balance it — a wide wordmark needs a *smaller* height than a
square mark or it looks twice as heavy. Roughly: wordmark 30px, lockup 40px,
square mark 47px.

If an image ever fails to load, the company name appears in type instead, so
the row never shows a broken image.

### Colours

Top of `assets/css/style.css`, in `:root`. Change a value there and it updates
everywhere on both pages. All text/background pairs currently meet WCAG AA
contrast — if you lighten the greens, re-check the white text on them.

---

## Notes

- **Fonts** load from Google Fonts (Bricolage Grotesque, Inter, Space Grotesk),
  as specified in the brand pack. If you'd rather not depend on Google — it's
  faster and avoids a GDPR grey area — the files can be self-hosted later.
- **Reduced motion** is respected: the stem draws instantly and nothing
  animates for visitors who've asked their OS for less movement.
- **No cookies, no trackers, no analytics.** If you want analytics, Plausible
  or Fathom are one script tag and don't need a cookie banner. Google Analytics
  does need one.
- **Social preview** is `assets/img/og.png` — it's what appears when the link is
  shared on LinkedIn, WhatsApp or Slack.
