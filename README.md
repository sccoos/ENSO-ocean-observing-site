# ENSO Ocean Observing Site

A static, generated website for California ocean observing information related to El Nino. Astro generates the deployable HTML, CSS, and JavaScript; Apache HTTP Server can serve the resulting `dist/` directory without a Node.js runtime.

## Environment

- Node.js `22.22.2` or newer. The project version is recorded in `.nvmrc`.
- npm `10` or newer.
- Astro with Tailwind CSS, Preline UI, and MDX.
- A modern browser for local development.

The precise dependency versions are locked in `package-lock.json`. Use the supported Node version before installing dependencies to avoid build-tool incompatibilities.

## Local development

From the repository root, select the project Node version. With [nvm](https://github.com/nvm-sh/nvm) installed:

```sh
nvm install
nvm use
```

Install the locked dependencies:

```sh
npm ci
```

Start one development server on a predictable local address:

```sh
npm run dev -- --host 127.0.0.1 --port 4321
```

Open [http://127.0.0.1:4321/](http://127.0.0.1:4321/) in a browser. Astro reloads the page after source-file changes. Stop the server with `Ctrl+C` in the terminal where it is running.

If dependencies change, run `npm install` instead of `npm ci` to update `package-lock.json`.

## Verification and production build

Run Astro's type and project checks:

```sh
npm run check
```

Generate the static production site:

```sh
npm run build
```

The deployable output is written to `dist/`. Preview that output locally with:

```sh
npm run preview
```

## Content and structure

- `src/pages/index.astro` assembles the page-level layout.
- `src/components/TopicTabs.astro` defines the shared Preline tab interface and tab order.
- `src/tab-content/*.mdx` contains the independently editable content for each tab. MDX supports normal Markdown plus Astro component imports, such as `EmbedFrame` for dashboards.
- `src/components/EmbedFrame.astro` provides the responsive embedded-dashboard wrapper.
- `src/styles/global.css` contains site-wide styles and imports Tailwind and the Preline theme.
- `public/` contains static files copied to the generated site unchanged, including partner logos.

## Deployment

Deployment only needs the contents of `dist/` after a successful `npm run build`. The web server should serve this directory as the site document root. Keep the build step in the GitHub-based deployment workflow; source files under `src/` are not served directly.
