# ui.anyknown.com as a product

Status: built and deployed (2026-10-15).

CEO feedback: the site reads like a bare index. It is a product too, so it must show use cases and situations, not a wall of text cards.

## The reader and what they decide

Three readers land on the site:

1. A builder of an AI-agent app (us, or a team like us). Decides: does this system already cover the moments my product has (agent working, agent waiting on me, files, voice, settings, vault)?
2. An outside agent (v0, Claude, Codex) making a one-off page. Decides: which file do I load (`brand.css`, `design.md`, `llms.txt`)?
3. A coding agent inside our repos. Decides: which component fits this moment, and what are the rules?

The old home answers none of these on first screen. It lists 57 families as text.

## Information architecture

Top bar, not a long left rail on every page:

- Situations — the new center of the site
- Components — a visual catalog (each card shows the component, not a sentence)
- Foundations — tokens (existing page)
- Guides — existing guides and reference docs
- For agents — `design.md`, `brand.css`, `llms.txt`, with copy buttons

The left rail stays only inside Components and Guides, where it lists that section.

## Home

1. Hero: one line on what the system is for, and next to it a live, running scene (an agent thread that streams a reply, runs tool calls, then stops on a permission card). Real components, not a picture.
2. Situations strip: one tile per situation, each tile is a small live render of that scene.
3. Three ways in, one per reader above, each with its one concrete first step (install command, `<link>` line, `llms.txt` URL).
4. Shipping in: the products that run on it (Anyknown Desktop, Storage, Accounts, Call, i18n), with what each uses.
5. The rules in one look: gray desk / white paper, ink for the one action, blue only while the agent works. Shown as three small visual specimens, not prose.

## Situations

Each situation is a full composed screen built only from `@anyknown/ui`, with fake data that reads real. Each page has:

- The moment: one or two sentences on what is happening to the person.
- The scene: interactive, works in light and dark, reads at 375 px.
- An "Inspect" switch that outlines each component in the scene and labels it with its name; a label links to the component page.
- Why it looks like this: three to five decisions, each one sentence (for example "the permission card stops the thread, but the composer stays usable").
- Components used: a list linking to component pages.

The eight situations:

1. agent-working — the agent streams a reply, folds its reasoning, runs tool calls with live status, a subagent runs under a tool card.
2. agent-needs-you — permission card and decision card waiting; the composer still works; answered cards collapse to a receipt.
3. review-changes — the agent finished; diff viewer of what changed, action bar, handoff receipt.
4. hand-over-files — dropzone, pending files in the composer, attachments in the sent message, upload progress.
5. voice-call — the composer becomes the call bar, voice indicator states, transcript bubbles.
6. vault — encrypted storage: file rows in a list, password input unlock, recovery key once.
7. settings-and-plan — settings page with groups, settings rows, switches, segmented, select, a danger action through a confirm dialog.
8. data-editing — data table with sort, filter, inline edit, selection and a bulk action; empty state when the filter matches nothing.

Component pages gain "Seen in" links back to the situations that use them. The scene file is the source of truth for that list (each scene exports the component folders it uses).

## Code layout

- `site/scenes/<id>.tsx` — one file per scene: `meta` (id, title, moment, decisions, uses) and `Scene` component.
- `site/scenes/index.ts` — the ordered list.
- `site/scenes/Inspect.tsx` — the inspect overlay: a wrapper `<Part name="composer">` that the scene puts around each component; outline and label only render while inspect is on.
- Smoke test: every scene renders, every `uses` entry is a real component folder.

## Steps

1. Shell: new top bar IA, routes `#/situations`, `#/situations/<id>`, `#/components` (catalog), `#/agents`; scene frame, Inspect, scene index with eight stub files; the `agent-working` scene fully done as the reference; new home. Verify: `pnpm typecheck:site && pnpm site:test`, light/dark/375 px screenshots.
2. Scenes 2–8, in parallel, each agent owns its own scene files only. Same verify.
3. Visual component catalog (live thumbnail per family) and "Seen in" on component pages. Same verify.
4. Review all pages in light, dark and 375 px; fix; dev server URL to the CEO; deploy with `pnpm site:deploy`.
