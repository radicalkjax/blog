# radicalkjax.com

My personal corner of the internet. A place to share my thoughts, projects, and journey.

## hey, I'm Kali <3

weeb | nerd | goober | hack-a-doodler | smartest airhead

I'm a Technical Solutions Architect, AI SecOps Researcher, and full-stack dev who fell into hacking through game modding and my love for music. These days I focus on reverse engineering, open-source tooling, and building things that help people.

This site is where I document my journey - the technical stuff, the personal stuff, and everything in between.

## what's here

**Blog** - thoughts on security, AI, malware analysis, and life as a trans girl.

**Projects** - things I'm building:
- Various security tools and experiments
- Rocket Pup (game concept)
- Caliphoria (post-apocalyptic California travel game)
- malwarEvangelist (community platform)

**Art** - photos and other creative stuff

**About Me** - the professional resume bits

## running locally

```bash
# clone it
git clone https://github.com/radicalkjax/blog.git
cd blog

# install dependencies
gem install jekyll bundler
bundle install
npm install

# run it (builds the slide decks, then serves)
npm start

# visit http://localhost:4000
```

## slide decks

Presentations use [Slidev](https://sli.dev), with Markdown sources in `projects/presentations/`. Requires Node **22.12 or newer**. Shared layouts and styles preserve the purple/DM Mono theme; DM Mono is bundled locally.

- **edit / preview:** `npm run slides:watch` opens the Vibe Coding deck with live reload. For another deck: `npx slidev projects/presentations/<slug>.md --open`.
- **build:** `npm run slides` builds decks listed in `_data/presentations.yml` into gitignored folders under `projects/presentations/<slug>/`. Run it before Jekyll; `npm start`, `npm run build`, and CI do this automatically. For a subpath deployment, set `SITE_BASEURL=/your-base` and use the same Jekyll `--baseurl`.
- **present:** open `/projects/presentations/<slug>/` in a browser, press `f` for fullscreen, or use the presenter button. Hash routing makes direct slide links work on GitHub Pages.
- **export PDF:** `npm run slides:export` writes `.slides-dist/presentation.pdf`. Chromium is installed by `playwright-chromium`; use `--executable-path` if you prefer a system browser.
- **add a deck:** create `<slug>.md`, use `theme: none`, `routerMode: hash`, `canvasWidth: 1280`, and `defaults: { layout: radicalkjax }`; add its slug, title, description, and tags to `_data/presentations.yml`.

Public builds omit speaker notes. The original Marp source, assets, theme, dependency lockfile, editor settings, and rendered baseline are preserved in `archive/marp/`, excluded from the published site. The former `.html` URL redirects to the Slidev deck. Offline caching is not enabled for Slidev yet; use an exported PDF or local Slidev server when presenting without a connection.

## tech stuff

Built with Jekyll and hosted on GitHub Pages. Uses the DM Mono font because monospace is life. The purple aesthetic (#6d105a) is very much intentional.

## philosophy

> Hacker joy isn't just about breaking things. It's about building communities that celebrate curiosity, learning, and authentic connection in our world.

I believe in opening doors and carving paths for others. Tech should be accessible, communities should be inclusive, and we should all be lifting each other up.

## connect

- 🌐 [radicalkjax.com](https://radicalkjax.com)
- 🦋 [Bluesky](https://bsky.app/profile/radicalkjax.bsky.social)
- 🐦 [Twitter/X](https://twitter.com/radicalkjax)
- 💼 [LinkedIn](https://linkedin.com/in/radicalkjax)
- 📸 [Instagram](https://instagram.com/radicalkjax)

---
