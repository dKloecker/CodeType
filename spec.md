# CodeType — Full Project Brief

---

## Overview

**CodeType** is a single-page web application for programming-focused typing practice, inspired by MonkeyType's philosophy of radical minimalism. Where MonkeyType trains prose typing speed, CodeType trains the muscle memory and syntax recall that separates a programmer who *thinks in code* from one who hunts for every bracket.

The core loop is identical to MonkeyType: land on the page, see code, start typing. No onboarding, no friction.

---

## Vision & Goals

**Primary goal**: A distraction-free environment where programmers can practice typing real, meaningful code — not random words — building both speed and syntax intuition simultaneously.

**What makes it different from MonkeyType**:
- Content is real, runnable code (algorithms, OSS snippets, LeetCode solutions)
- Indentation is a first-class citizen, mirroring real IDE behaviour
- Progress is measured in **Lines Per Minute** alongside WPM/CPM, which is more meaningful for code
- Language selector shapes both the content *and* the syntax highlighting
- Special character fluency (brackets, arrows, colons) is a core training outcome

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | **Nuxt 3** | SSR-friendly, file-based routing, Nitro backend included |
| UI Components | **NuxtUI (latest)** | Headless + styled, consistent with Nuxt ecosystem |
| Styling | **Tailwind CSS** | Utility-first, pairs naturally with NuxtUI |
| Syntax Highlighting | **Shiki** via `@nuxtjs/shiki` | Token-level accuracy, SSR-safe, no editor overhead |
| Backend | **Nitro** (Nuxt built-in) | API routes co-located, no separate server needed |
| Data | **Static JSON files** | No database for prototype; fast, portable, version-controllable |

---

## Aesthetic & Style Guide

**Direction**: Terminal-green minimalism with organic grain texture. A programmer's dark IDE with soul — not neon cyberpunk, not sterile SaaS. Worn-in, focused, alive.

**Reference**: The RevX site (built with NuxtUI) — note the near-black surfaces, subtle grain overlay, and how UI elements appear to float rather than sit on a background.

### Colour Palette
```css
:root {
  --bg-base:        #1a1a1a;   /* near-black canvas */
  --bg-surface:     #222222;   /* slightly lifted surfaces */
  --bg-overlay:     #2a2a2a;   /* menus, popovers */

  --accent-primary: #4ade80;   /* green-400 — cursor, active states, correct chars */
  --accent-dim:     #22c55e;   /* green-500 — hover */
  --accent-muted:   #166534;   /* green-900 — background tints */

  --text-primary:   #e5e5e5;   /* body text */
  --text-muted:     #6b7280;   /* ghost text, inactive labels */

  --error-color:    #f87171;   /* red-400 — incorrect characters */
}
```

### Grain Texture
Applied as a CSS SVG filter pseudo-element on `body` — no image file dependency. Opacity `0.035`, `position: fixed`, `pointer-events: none`. Creates the tactile, slightly analog quality of the RevX reference.

### Typography
- **Font**: `JetBrains Mono` (Google Fonts) — used universally across UI and code
- **Typing area**: `1.1rem`, `line-height: 1.8`
- **App name**: weight `300`, wide letter-spacing, small size — disappears into the chrome
- **Everything else**: weight `400`, muted color, stays out of the way

### UI Rules
- Mode selector pills: text-only with bottom-border active state. No filled backgrounds.
- No box shadows anywhere. Corners max `4px` radius.
- Typing area has no visible border — it floats. Faint `1px` separator lines (`#333`) only where needed.
- All transitions `200ms ease`. Hover = opacity shift only.
- Stats bar muted at rest → animates to full brightness on first keypress.

---

## Content Library

All snippets stored as JSON in `/server/data/snippets/` with this shape:

```ts
interface Snippet {
  id: string
  title: string
  category: 'algorithm' | 'leetcode' | 'oss' | 'language-specific'
  language: 'python' | 'typescript' | 'cpp'
  lines: number        // precomputed on creation
  code: string         // raw string, indentation preserved exactly
}
```

### Categories & Initial Content

**Algorithms** (5):
Bubble Sort, Binary Search, Dijkstra's, Merge Sort, BFS
→ Provide at minimum one Python and one TypeScript implementation each

**LeetCode Classics** (5):
Two Sum, Valid Parentheses, Reverse Linked List, Climbing Stairs, Maximum Subarray
→ At minimum: Python + TypeScript for Two Sum; one C++ solution

**OSS Snippets**:
FastAPI route handler (Python), Linux kernel linked list macro (C++), a clean Express middleware example (TypeScript)

**Language-Specific**:
C++ shared pointer implementation, Python decorator pattern, TypeScript generic utility types (`Partial`, `Pick`, custom)

**Minimum viable content**: 2 snippets per language across the categories so all filter combinations return a result.

---

## Page Layout

**Single route only: `/`**

```
┌─────────────────────────────────────────────────────┐
│  codetype                              [⚙ settings] │  ← AppHeader.vue
├─────────────────────────────────────────────────────┤
│                                                     │
│    [algorithms] [leetcode] [oss] [language-specific]│
│    [python]  [typescript]  [cpp]                    │  ← ModeSelector.vue
│    [10 lines]  [20 lines]  [30 lines]  [50 lines]   │
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │ def dijkstra(graph, start):                   │  │
│  │     dist = {node: float('inf')                │  │  ← TypingArea.vue
│  │         for node in graph}                    │  │
│  │     dist[start] = 0                           │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│    LPM: 4.2  │ WPM: 67  │ CPM: 312  │ ACC: 97.1%   │  ← StatsBar.vue
│                                                     │
│         tab + enter — restart  •  esc — reset       │  ← footer hint
└─────────────────────────────────────────────────────┘
```

Selecting any filter immediately fetches and loads a new matching snippet. Filters combine — `algorithms + python + 20 lines` picks the closest match. On no exact match, relax the lines constraint first.

---

## Project File Structure

```
codetype/
├── app.vue
├── nuxt.config.ts
├── tailwind.config.ts
│
├── assets/css/
│   └── main.css                  # CSS vars, grain texture, global resets
│
├── components/
│   ├── AppHeader.vue             # App name + settings icon
│   ├── ModeSelector.vue          # Category / language / line-count tabs
│   ├── TypingArea.vue            # <pre> + <span> rendering, hidden input
│   ├── StatsBar.vue              # Live LPM / WPM / CPM / ACC / timer
│   ├── ResultsOverlay.vue        # End-of-snippet results screen
│   └── IndentSettings.vue        # Popover: tab vs spaces, width
│
├── composables/
│   ├── useTypingEngine.ts        # Core state machine
│   ├── useSnippet.ts             # Fetches snippet, reacts to filter changes
│   ├── useMetrics.ts             # CPM / WPM / LPM / ACC calculations
│   └── useIndentConfig.ts        # Indent preferences (persisted to localStorage)
│
├── server/
│   ├── api/snippets/
│   │   ├── index.get.ts          # GET /api/snippets?category=&language=&lines=
│   │   └── [id].get.ts           # GET /api/snippets/:id
│   │
│   └── data/snippets/
│       ├── algorithms/           # bubble-sort.python.json, etc.
│       ├── leetcode/             # two-sum.python.json, etc.
│       ├── oss/                  # fastapi-route.python.json, etc.
│       └── language-specific/    # shared-pointer.cpp.json, etc.
│
└── pages/
    └── index.vue                 # Composes all components
```

---

## Core Typing Engine

Implemented in `composables/useTypingEngine.ts`. This is the highest-risk piece of the application — get this right first before building UI polish.

### State Shape

```ts
interface CharState {
  index:     number
  char:      string
  color:     string        // syntax color from Shiki token
  status:    'untyped' | 'correct' | 'incorrect' | 'cursor'
  isNewline: boolean
  isIndent:  boolean
}

interface EngineState {
  snippet:     Snippet
  flatChars:   CharState[]
  cursorIndex: number
  startTime:   number | null
  finished:    boolean
  errors:      Set<number>
}
```

### Shiki Token → CharState Merge Algorithm

```
1. Tokenize snippet.code with Shiki for the given language
   → produces Token[] where Token = { text: string, color: string }

2. Flatten all tokens into individual characters:
   FOR each token:
     FOR each char in token.text:
       push { char, color: token.color }

3. Build CharState[] from flattened chars, marking isNewline and isIndent

4. isIndent: for each line, characters before the first non-whitespace
   character are marked isIndent = true

5. Return the CharState[]

On render: each CharState = one <span>
  style="color: {color}; opacity: {status === 'untyped' ? 0.35 : 1}"
  class="char-{status}"
```

### Keyboard Handler

```
Tab       → preventDefault(); insert N spaces or \t per useIndentConfig
Enter     → treat as \n; trigger smart newline handler
Backspace → if prev char is not a locked newline: status = 'untyped', cursor--
Escape    → full reset
Printable → compare to flatChars[cursorIndex].char
              match   → status = 'correct', cursor++
              no match → status = 'incorrect', cursor++ (errors.add(index))
            if cursor was 0: startTime = Date.now()
            if cursor === flatChars.length: finish()
```

### Smart Indent / Newline Handler

When cursor lands on `\n`:
```
1. Mark \n as 'correct', advance cursor
2. While next char is isIndent:
     mark as 'correct', advance cursor
3. Cursor now sits at first real character of the new line
```

This mirrors real IDE behaviour — press Enter, land at the correct indent level automatically.

---

## Metrics

| Metric | Formula |
|---|---|
| CPM | `(correctChars / elapsedSeconds) × 60` |
| WPM | `CPM / 5` |
| LPM | `(completedLines / elapsedSeconds) × 60` |
| Accuracy | `(correctChars / totalTypedChars) × 100` |

Stats begin on first keypress, update every 250ms via `setInterval`.

---

## Completion Flow

1. `finish()` called when `cursorIndex === flatChars.length`
2. Final metrics snapshot taken
3. `ResultsOverlay.vue` fades in over the typing area
4. Overlay displays: WPM · CPM · LPM · Accuracy · Time · Error count
5. `Tab + Enter` at any time (mid-test or post-test) resets to a new snippet with the same active filters

---

## Indentation Settings

Accessible via the `⚙` icon in the header. Persisted to `localStorage` via `useIndentConfig.ts`.

| Setting | Options | Default |
|---|---|---|
| Indent style | `tabs` / `spaces` | `spaces` |
| Spaces per tab | `2` / `4` | `4` |

On snippet load, if the user's indent style differs from the snippet's, normalise the snippet's leading whitespace to match before building the CharState array.

---

## Implementation Constraints

- **No Monaco, no CodeMirror** — raw `<pre><span>` rendering only
- Hidden input must have `autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"`
- Page click anywhere → focus the hidden input
- Backspace **cannot** move past a completed (locked) newline
- Shiki tokenizes **once per snippet load**, never on keypress
- Grain texture via CSS SVG filter — no external image assets
- All colours via CSS variables — no hardcoded hex in `.vue` files
- `JetBrains Mono` loaded in `nuxt.config.ts` under `app.head.link`
- Stats only start counting on first keypress

---

## Build Order (Recommended)

Build and validate in this sequence — each phase is a stable, demonstrable checkpoint:

1. **Typing engine** — hardcoded snippet, character comparison, cursor rendering
2. **Indent logic** — newline auto-advance, settings popover, normalisation
3. **Shiki integration** — token → CharState merge, faded/highlighted rendering
4. **Content + API** — JSON snippets, Nitro routes, filter logic
5. **Mode selector** — filter UI wired to snippet fetch
6. **Metrics + completion** — StatsBar live updates, ResultsOverlay
7. **Polish** — grain texture, transitions, keyboard shortcuts, responsive tweaks

---

*Prototype scope: single page, three languages, ~15 snippets, no auth, no persistence beyond indent preferences.*
