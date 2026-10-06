# Contributing

How to set up the repo, the scripts, the commit convention, the house rules, and the checklist for adding a component.

## Setup

The repo uses pnpm 10 (`packageManager` pins `pnpm@10.30.3`; Corepack picks it up).

```bash
pnpm install
pnpm build   # dist/: ESM + d.ts + tokens.css + scrollbar.css + brand.css
```

The playground and the docs site render from the built `dist/`, so run `pnpm build` before them.

## Scripts

| Script | What it does |
| --- | --- |
| `pnpm build` | Cleans and builds `dist/`: `tsc`, ESM import extensions, copies `tokens.css` and `scrollbar.css`, builds `brand.css`. |
| `pnpm typecheck` | `tsc --noEmit` for the library, then the playground and the docs site (each maps `@anyknown/ui` to `src/`). |
| `pnpm typecheck:playground` | Type-checks the playground only. |
| `pnpm typecheck:site` | Regenerates `site/generated/*.json`, then type-checks the docs site. |
| `pnpm gen:api-docs` | Regenerates `site/generated/api.json` and `tokens.json` from the TypeScript source (`scripts/api-docs.mjs`). |
| `pnpm lint` | `oxlint src`. |
| `pnpm fmt` | Formats with `oxfmt`. |
| `pnpm fmt:check` | Checks formatting without writing. |
| `pnpm gen:themes` | Regenerates `src/themes.stylex.ts` from the tokens. Never edit that file by hand. |
| `pnpm gen:tokens-css` | Regenerates `src/tokens.css` (the `--ak-*` variables) from `src/tokens.stylex.ts`. |
| `pnpm check` | `turbo run typecheck lint fmt:check design:check`, in parallel and cached. |
| `pnpm design:check` | Checks that `DESIGN.md` and `src/brand.css` name the same `ak-*` classes (see below). |
| `pnpm design:lint <file.html>…` | Counts design mistakes in one-off HTML pages (see below). Add `--json` for machine output. |
| `pnpm test` | Runs vitest (jsdom + Testing Library). |
| `pnpm playground` | The demo app at <http://localhost:5199>, rendering every component from `dist/`. |
| `pnpm site` | The docs site at <http://localhost:5200>. |
| `pnpm site:test` | jsdom smoke tests for the docs site (content rules and every page rendering). |
| `pnpm site:build` | Builds `dist/`, then the site, then `llms.txt`. |
| `pnpm site:deploy` | `site:build`, then deploys to <https://ui.anyknown.com> with Wrangler (needs `wrangler login`). |
| `pnpm verify:pack` | Builds, packs, and resolves every `exports` entry from outside the package. |
| `prepublishOnly` | Runs `check`, `test` and `verify:pack` before a publish. |

`pnpm site`, `pnpm site:build` and `pnpm site:test` regenerate `site/generated/api.json` (props tables) and `site/generated/tokens.json` (the tokens page) with `scripts/api-docs.mjs`. To regenerate them by hand, run `node scripts/api-docs.mjs`.

### Turbo and the remote cache

`check`, `test`, `build` and the site tasks run through [Turborepo](https://turborepo.dev) in single-package mode (`turbo.json`). The cache is pushed to the self-hosted remote cache at `https://turbo.anyknown.com` (team `anyknown-ui`). To use it locally, export the token:

```bash
export TURBO_TOKEN=<token>
```

Without it, Turbo falls back to the local cache. The `build`, `lint`, `typecheck` and `test` inputs leave out `*.md`, so editing docs does not rerun them. `site:build` and `site:test` use the default inputs, because the site reads the Markdown.

## Commits

- Write commit messages in English.
- The title follows [Conventional Commits](https://www.conventionalcommits.org): `<type>(<optional scope>): <summary>`. Use the imperative mood, lower case, no trailing period, at most 72 characters.
- Types: `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `revert`.
- A breaking change has `!` after the type or scope, and a `BREAKING CHANGE:` footer.
- One topic per commit.

```text
feat(toast): add a key option that de-duplicates toasts
fix(select)!: rename onChange to onValueChange

BREAKING CHANGE: Select no longer accepts onChange.
```

## House rules

### No `useEffect`

Do not sync state or set up DOM work in `useEffect`. Use instead:

- a **ref callback** with a cleanup function (React 19) for listeners, observers and measuring (`ResizeObserver`);
- **`useSyncExternalStore`** for anything outside React (media queries, `document.hidden`);
- an **external store** (`createStore` / `useStore` from `src/lib/store.ts`) for shared state.

A few older uses remain (`Formula`, `ReasoningFold`, `DataTable`, and `src/lib/useAnimationFrame.ts` and `useCopy.ts`). Do not add more. See [State management](./docs/guides/state.md).

### Tokens only

Every color, space, corner, type size, motion value, z-index and breakpoint comes from `src/tokens.stylex.ts`. No raw hex colors, durations or sizes in components.

- **The literal guard** (`src/test/literals.test.ts`, part of `pnpm test`) scans `src/components` (not tests, not comments) for a raw hex color, a raw duration such as `120ms`, a raw `zIndex` number, a raw `fontSize`, and a raw number in an `@media` breakpoint. Today's leftovers are counted per file in `src/test/literal-baseline.json`. A file that goes over its count, or a new file with any, fails. When you remove literals, the test also fails and asks you to lower the baseline with `UPDATE_LITERAL_BASELINE=1 pnpm vitest run src/test/literals.test.ts` (it never raises a count). A literal that must stay says why on the same line or the line above: `// literal-ok: white thumb on any track color`.
- **`pnpm design:check`** (in `pnpm check`) keeps `DESIGN.md` and `src/brand.css` in sync: every `ak-*` class the doc names must exist in the CSS, and every class in the CSS must appear in the doc.
- **`pnpm design:lint`** is for one-off HTML pages built on `brand.css`, not for components. Per file it counts raw hex colors, other color functions and named colors, classes outside the `brand.css` vocabulary, `font-family` without a `--ak-font-*` variable, overshooting easings, inline `style` attributes, overused stat blocks, and full-width tables with two columns or fewer.

### Never hand-tune a color

Colors come from 12-step OKLCH scales in `scripts/palette.mjs`. To change a color:

1. Change the scales (`GRAY`, `STEPS`, `HUES`) or the `ROLES` mapping in `scripts/palette.mjs`.
2. Run `node scripts/palette.mjs`. The contrast table must show zero failures.
3. Paste the printed JSON into `color` and `tone` in `src/tokens.stylex.ts`.
4. Run `pnpm gen:themes` and `pnpm gen:tokens-css`.

`src/themes.test.ts` and `src/tokens-css.test.ts` fail when the generated files drift from `tokens.stylex.ts`.

### Accessibility

- Every component has an axe test using `expectNoAxeViolations()` from `src/test/axe.ts`. It checks `document.body` by default, so portalled popups are included. Today the shared sweep is `src/test/a11y.test.tsx`; add your component there or to its own test file.
- Test the keyboard with `@testing-library/user-event`.
- Every animation honors `prefers-reduced-motion`; `src/test/reduced-motion.test.ts` enforces it.

See [Accessibility](./docs/guides/accessibility.md).

### JSDoc on every public prop

`scripts/api-docs.mjs` reads the props of every component exported from `src/index.ts` and builds the props tables on the site. Write a JSDoc comment on every public prop. Use `@default` for the default (otherwise the destructuring default is shown) and `@deprecated` with the replacement.

```ts
export type ThingProps = {
  /** How wide the thing is. @default "sm" */
  size?: "sm" | "md"
  /** @deprecated Use `size` instead. */
  wide?: boolean
}
```

### Built-in words

Words a component owns (`aria-label`s, screen-reader prefixes, its own button text) go through `defineStrings` from `src/lib/i18n.tsx`, with both `zh-TW` and `en`. Read them with `useStrings(strings, labels)` and accept a `labels?: Partial<…Labels>` prop for overrides. See [Internationalization](./docs/guides/i18n.md).

### StyleX pitfalls

- **StyleX 0.19 silently drops shorthands** such as `all: unset`, `border: 0` and `background: none`. No CSS comes out, and the native control's look stays on screen. Put `reset.control` from `src/lib/styled.ts` first in `stylex.props(...)`, then write longhands.
- **Use `sx`, not `className`, for caller styles.** StyleX classes are atomic, and a class string appended later is not guaranteed to win. A component that needs outside adjustment takes `sx?: StyleArg` and applies it last in the same `stylex.props` (or `styled`) call.

More conventions are in [src/components/README.md](./src/components/README.md).

## Adding a component

1. Create `src/components/<folder>/` with:
   - `<Name>.tsx` — the implementation.
   - `<Name>.test.tsx` — behavior, keyboard and axe tests.
   - `README.md` — a `# Title`, a lead paragraph, and these sections in order: `## When to use`, `## When not to use`, `## Usage`, `## Accessibility`, `## Keyboard`, `## Related`.
2. Export the component and its `<Name>Props` type from `src/index.ts`.
3. Add a demo in `playground/demos/` with `covers: ["<folder>"]`.
4. Add a decision-log entry to [src/components/COMPONENTS.md](./src/components/COMPONENTS.md): what you chose and why, and the dead ends.
5. Add the folder to one group in `COMPONENT_GROUPS` in `site/content.ts`.

`pnpm site:test` enforces the README (the lead and the sections), the group (every folder in exactly one), and that demo `covers` name real folders. Before porting a component, read its section in COMPONENTS.md; copy the numbers, do not retune them.

## Where docs live

| Kind | Location |
| --- | --- |
| Guides (getting started, theming, state, accessibility, i18n, text layout) | `docs/guides/*.md` |
| One component's usage, accessibility and keyboard | `src/components/<folder>/README.md` |
| Props tables | JSDoc in the source, via `scripts/api-docs.mjs` |
| Component conventions | `src/components/README.md` |
| Why each component is the way it is | `src/components/COMPONENTS.md` |
| Known accessibility gaps | `src/components/A11Y-DEBT.md` |
| Page-level design judgment and the `brand.css` vocabulary | `DESIGN.md` |
| Design plans and specs | `docs/plans/` |
| Install, structure and release | `README.md` |
| This file | `CONTRIBUTING.md` |

The docs site renders all of these. Write relative links between them (for example `./docs/guides/i18n.md`); the site rewrites them.
