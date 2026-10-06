# Ghost

A word that is a button: a 28 px muted text pill with no background until the pointer is on it. The family also exports `GhostLink`, the same word as a link.

## When to use

- A low-weight action in dense chrome, such as "Edit" or "Show all" beside a heading.
- A link that leaves the app, styled the same as the actions around it (`GhostLink`, `external` for a new tab).
- A small destructive word that should still read as danger (`danger`).

## When not to use

- For a standard action in a form or dialog footer, use [Button](../button/README.md) (`variant="ghost"` for the quiet one).
- For a glyph with no word, use [IconButton](../icon-button/README.md).

## Usage

```tsx
import { Ghost, GhostLink } from "@anyknown/ui"

<Ghost onClick={editProfile}>Edit</Ghost>
<Ghost danger onClick={signOut}>Sign out</Ghost>
<GhostLink href="https://anyknown.com/help" external>Help center</GhostLink>
```

`Ghost` passes all `<button>` props through except `type`. `GhostLink` takes only `href`, `children`, `external` and `sx`. On phone widths both grow to a 40 px minimum height.

## Accessibility

- `Ghost` renders a native `<button type="button">`; the label is the children. `disabled` is native and drops opacity to 0.4.
- `GhostLink` renders a native `<a href>`. With `external` it adds `target="_blank"` and `rel="noreferrer"`. It does not announce that it opens a new tab; say so in the text if that matters.
- Both are 28 px tall (40 px on phones), above the 24 px minimum target.
- Focus ring: a 2 px `focusRing` outline, offset 2 px, on `:focus-visible` (`Highlight` under forced colors).
- Under `forced-colors: active` the hover wash is dropped, so hover draws a 1 px `ButtonText` outline instead (not on a disabled `Ghost`).
- Pressing scales to 0.98; no scale and no transition under `prefers-reduced-motion`.
- `danger` is color only; the word must carry the meaning.

## Keyboard

| Key | Action |
| --- | --- |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Activates a `Ghost` (native `<button>`). |
| <kbd>Enter</kbd> | Follows a `GhostLink` (native `<a>`). |

## Related

- [Button](../button/README.md) — the full-size button with variants.
- [IconButton](../icon-button/README.md) — the glyph-only counterpart.
