# PHÁT TÀI PHÁT LỘC

A small personal digital garden for things I read, play, build and learn.

**Planned domain:** https://phattaiphat.loc.cc

This is intentionally a static website: HTML + CSS + JavaScript + JSON. There is no backend, login, database, tracker or build step in Version 1.

## What is included

- Responsive homepage
- Reading log + reading companion + spoiler-protection demo
- Gaming journey + current party table + activity log
- Notes / knowledge garden + tag filters
- Personal projects
- 30-minute English speaking lab with LocalStorage
- Training dashboard
- Film photography log
- Lab with a few tiny working tools
- Site-wide client-side search (`Ctrl/Cmd + K` also works)
- Light / dark theme saved in LocalStorage
- GitHub Pages compatible folder routes
- Sample data that can be replaced gradually

## Project structure

```text
phat-tai-phat-loc/
├─ index.html
├─ CNAME
├─ .nojekyll
├─ 404.html
├─ assets/
│  ├─ styles.css
│  └─ app.js
├─ data/
│  ├─ books.json
│  ├─ games.json
│  ├─ notes.json
│  ├─ projects.json
│  ├─ training.json
│  ├─ photography.json
│  └─ english-topics.json
├─ reading/index.html
├─ gaming/index.html
├─ notes/index.html
├─ projects/index.html
├─ english/index.html
├─ training/index.html
├─ photography/index.html
└─ lab/index.html
```

## Run locally

Do **not** double-click `index.html`, because browsers normally block JSON `fetch()` requests from `file://` pages.

From the project folder, start any small static server.

### Python

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

### VS Code

You can also use the **Live Server** extension and open the root `index.html`.

## Change the content

Most personal content lives in `/data`. The goal is to make the site feel like a garden: add data, not UI code.

### Add a book

Edit `data/books.json` and add an object:

```json
{
  "title": "Book title",
  "author": "Author",
  "status": "Reading",
  "progress": "Chapter 4",
  "percent": 20
}
```

Supported sample statuses are:

- `Reading`
- `Finished`
- `Want to Read`

### Add a game

Edit `data/games.json`:

```json
{
  "title": "Game title",
  "platform": "Nintendo 3DS",
  "status": "Playing",
  "progress": "Chapter 7"
}
```

Suggested statuses:

- `Playing`
- `Completed`
- `Backlog`
- `Dropped`

### Add a note

Edit `data/notes.json`:

```json
{
  "title": "What is something?",
  "summary": "A short note can be enough.",
  "tags": ["Technology"],
  "date": "16 Sep 2026"
}
```

Notes appear automatically in Notes, Today I Learned, homepage recent notes, and search.

### Add a project

Edit `data/projects.json`:

```json
{
  "title": "Project name",
  "status": "Building",
  "description": "What it is.",
  "why": "Why I built it.",
  "learned": "What I learned.",
  "next": "The next idea.",
  "tech": ["HTML", "JavaScript"]
}
```

## Update the homepage “Currently” cards

The homepage automatically picks:

- first book with `status: "Reading"`
- first game with `status: "Playing"`
- first project with `status: "Active"`
- the current training program
- the first film roll in the photography data

So changing the JSON is usually enough.

## English LocalStorage

The English page saves only browser-local practice data:

- completed days
- minutes practiced
- simple streak count
- whether today's practice is already logged

No data is sent anywhere.

To reset it while testing, open browser DevTools → Application / Storage → Local Storage and delete keys beginning with `ptpl-english-`.

## Dark mode

The theme button stores `ptpl-theme` in LocalStorage. If no preference has been saved, the site follows the operating system preference on first load.

## Deploy to GitHub Pages

### 1. Create / use a GitHub repository

Put all files from this folder at the repository root and push them to your default branch (usually `main`).

### 2. Turn on GitHub Pages

In GitHub:

1. Open **Settings** → **Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**.
3. Select branch `main` and folder `/ (root)`.
4. Save.

There is no build command because this is already a static site.

### 3. Custom domain

The included `CNAME` file contains:

```text
phattaiphat.loc.cc
```

Keep the DNS record for `phattaiphat.loc.cc` pointed to the GitHub Pages host you configured. In GitHub Pages settings, set the same custom domain and enable **Enforce HTTPS** once GitHub finishes provisioning the certificate.

> If you temporarily deploy under a repository URL such as `username.github.io/repository/`, the JavaScript determines its own root path from `assets/app.js`, so internal links and JSON should still work.

## Where to edit the design

All visual rules live in:

```text
assets/styles.css
```

Important CSS variables are at the top:

```css
--bg
--surface
--text
--muted
--line
--green
--amber
--radius
--max
```

Changing those values is the fastest way to alter the visual personality without redesigning every component.

## Where to edit behavior

All Version 1 behavior lives in:

```text
assets/app.js
```

The file contains separate rendering functions for each section, plus shared theme, search, navigation and data-loading helpers.

## Suggested next versions

Good additions later, without changing the basic philosophy:

- book detail files with per-chapter `knownAfter` spoiler thresholds
- relationships between reading characters
- richer game logs and party history
- Markdown note support
- charts for gym progression
- real film scans in the Photography gallery
- a tiny content editing script that updates JSON for you
- RSS / changelog

Avoid adding a backend until a real need appears. The static JSON approach is a feature here: it keeps the garden understandable, portable and inexpensive.
