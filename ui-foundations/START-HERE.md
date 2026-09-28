# MicroBiz UI foundations — developer handoff

This folder is a standalone snapshot of the current React application, including
its live UI Foundations page and all implemented pages, shared components,
styles, icons (via lucide-react), brand assets, design references, demo data,
tests and documentation. You can zip this entire folder and share it.

## Run locally

Install Node.js 22 LTS and npm, then run these commands inside this folder:

```sh
npm ci
npm run dev
```

Open the URL printed by Vite, click **Sign in**, then choose **UI Foundations**
in the sidebar, or visit `/ui-foundations`. Local development defaults to demo
mode; no staff credentials or backend are needed. Demo changes are in memory.

## Start reusing the UI

- `src/pages/UiFoundationsPage.jsx`: live gallery, interactive samples and usage snippets.
- `src/styles/global.css`: shared tokens, component styles and responsive layouts.
- `src/styles/foundations.css`: gallery-specific layout styles.
- `src/components/ui/`: buttons, fields, badges, dialogs, tabs, metrics and feedback.
- `src/components/layout/` and `src/layouts/`: page header, navigation and application shell.
- `src/components/data/DataTable.jsx`: desktop tables and mobile records.
- `src/components/cards/CardVisual.jsx`: masked Professional and Business card previews.
- `src/features/` and `src/pages/`: implemented workflows and page composition examples.
- `public/assets/`: supplied logo and branded loading strip.
- `public/references/`: original design reference sheets; development reference only.
- `docs/phases/PHASE-01-FOUNDATION.md`: foundation reuse contract.
- `BUILD.md`: application architecture and design rules.
- `docs/API-INTEGRATION.md`: adapter boundaries and remaining integration work.

Use the existing components and CSS variables when adding pages. Icon components
come from `lucide-react` and are installed by `npm ci`. Preserve the relative
asset imports and shared stylesheet when moving components to another project.
The Inter font is not bundled; the existing font stack uses platform fallbacks.

## Build and check

```sh
npm test
npm run verify:release
```

For a shareable demonstration build, copy `.env.example` to `.env`, leave
`VITE_DATA_MODE=demo`, then run:

```sh
npm run build
npm run preview
```

Without that explicit demo setting, production builds default to API mode and
staff access remains closed until an approved authentication/API adapter exists.
Browser suites require a separately available Playwright installation; see README.md.

## Packaging notes

This is a snapshot, not a separately maintained component package. Original source
files are copied unchanged. `HANDOFF-MANIFEST.json` records their SHA-256 hashes.
No node_modules, generated dist, Git history, local environment files or workstation
metadata are included. The `.env.example` contains public configuration examples.
Design references are supplied for developer use and excluded from production builds
by the included Vite configuration. The gallery and implemented workflows show the
current frontend; backend-dependent capabilities retain their existing limitations.
