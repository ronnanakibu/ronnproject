# ronnproject.my.id

Personal terminal portfolio hub for Ronn — Computer Engineering student at Politeknik Negeri Medan & Creative Technologist.

A brutalist terminal experience: hard monospace shell on the outside, calm and functional on the inside. Visitors can interact by typing commands or tapping the quick-access chip shortcuts.

---

## Tech Stack & Architecture

- **Core**: Vanilla TypeScript in strict mode, Vite, Vitest.
- **Frameworks**: None (Zero UI framework, zero runtime state libraries).
- **Styling**: Vanilla CSS with CSS custom properties (Design Tokens).
- **Typography**: Self-hosted `@fontsource/martian-mono` (Latin subset: 400, 500, 700, 800).
- **Deployment**: Static output on Vercel with strict Content-Security-Policy and security headers.

---

## Getting Started

### Prerequisites
- Node.js >= 18
- npm >= 9

### Commands

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Run full test suite (Vitest: parser, history, registry, safe-rendering, XSS, contrast)
npm test

# Typecheck and build static production bundle to dist/
npm run build

# Preview production build locally
npm run preview
```

---

## How-To Guides

### 1. Adding a New Command
The command registry is fully modular. Adding a new command requires **only one new file and one line in the registry**:

1. Create `src/commands/<name>.ts`:
```ts
import type { Command, OutputBlock } from '../terminal/types.js';

export const myCommand: Command = {
  name: 'mycommand',
  aliases: ['mc'],
  description: 'Deskripsi perintah singkat.',
  usage: 'mycommand [arg]',
  complete(partial: string) {
    return ['option1', 'option2'].filter((o) => o.startsWith(partial.toLowerCase()));
  },
  run(ctx, args): OutputBlock {
    return {
      type: 'text',
      content: `Hasil: ${args.join(' ') || 'default'}`,
    };
  },
};
```

2. Register it in `src/commands/index.ts`:
```ts
import { myCommand } from './mycommand.js';

const allCommands: Command[] = [
  // ...
  myCommand,
];
```
Done! Autocomplete, help listing, and execution will work automatically.

---

### 2. Adding or Editing a Project
Projects are typed and stored in `src/data/projects.ts`:

```ts
export const projects: Project[] = [
  {
    slug: 'my-project',
    title: 'my-project',
    description: 'Deskripsi singkat proyek.',
    url: 'https://my-project.ronnproject.my.id',
  },
  // ...
];
```
*Note: Vitest automatically tests that no placeholder brackets (`[` or `]`) exist in URLs.*

---

### 3. Changing or Adding Theme Tokens
Theme tokens live in `src/styles/tokens.css`. Both themes (`paper` and `ember`) are defined as CSS variables:

```css
:root,
[data-theme='paper'] {
  --bg-page: #D9D8D2;
  --bg-window: #F2F1EC;
  --bg-dock: #D9D8D2;
  --ink: #000000;
  --muted: #4A4A46;
  --accent: #2430FF;
  --frame: #000000;
  --line: #000000;
  /* ... */
}

[data-theme='ember'] {
  --bg-page: #120C08;
  --bg-window: #1F150F;
  --bg-dock: #150E09;
  --ink: #EFE3D3;
  --muted: #B9A794;
  --accent: #E07B39;
  /* ... */
}
```
*Every color pair is tested with WCAG 2.1 AA luminance equations in `src/__tests__/contrast.test.ts` to ensure contrast $\ge 4.5:1$.*

---

## Security & Privacy

- **Strict CSP**: Defined in `vercel.json` with hash-pinned inline scripts, `connect-src 'none'`, and `frame-ancestors 'none'`.
- **Zero innerHTML with user input**: All rendering in `src/terminal/render.ts` uses `document.createElement` and `textContent`.
- **URL Whitelisting**: The `open <slug>` command strictly opens projects defined in `data/projects.ts` with `rel="noopener noreferrer"`.
- **Zero backend/secrets**: 100% static client-side bundle.

---

## Performance & Accessibility

- **JS Bundle**: ~3.6 KB gzipped (budget: < 20 KB).
- **CSS Bundle**: ~2.3 KB gzipped.
- **Full Touch & Keyboard Nav**:
  - Touch targets $\ge 44\text{px}$ on mobile.
  - Tab navigation with `3px solid var(--focus)` outline ring.
  - Sideways-scrolling chip bar for mobile thumbs.
  - Screen reader announcements via dynamic `aria-live="polite"` region.
  - Automatic `prefers-reduced-motion` detection (disables cursor blink and all transitions).
- **No-JS Fallback**: Search crawlers and users with JS disabled receive clean semantic HTML listing all projects and contact links.
