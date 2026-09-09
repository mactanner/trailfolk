# Copilot instructions for Trailfolk Schweiz

## Project overview

Trailfolk Schweiz is a small React/Vite demo for WebMCP. It renders a static
selection of 50 Swiss hikes, lets users filter them in the browser, and
exposes the same filtering actions to an AI tool through WebMCP.

The app should continue to work as a normal browser UI when
`document.modelContext` is unavailable.

## Build, lint, and test commands

Run commands from the repository root:

```bash
npm install       # install dependencies
npm run dev       # start the Vite development server
npm run build     # run TypeScript project checks and create a production build
npm run lint      # run Oxlint
npm run preview   # serve the production build locally
```

There is currently no test runner, test script, or test file in the repository,
so no single-test command is available.

## Architecture

- `src/main.tsx` is the browser entry point. It imports global styles and mounts
  `App`. Do not wrap it in React `StrictMode`: WebMCP tool registration is an
  external side effect and StrictMode repeats effects in development.
- `src/App.tsx` owns the page UI, filter state, client-side filtering, active
  filter display, reset behavior, and WebMCP tool registration.
- `src/hikes.ts` contains the static `Hike` records used by both the UI and
  WebMCP results.
- `src/hikeFilterSchema.ts` defines the shared filter types, allowed difficulty
  and Swiss-region values, and the WebMCP input schema.
- `src/webmcp.d.ts` provides the local TypeScript declarations for the optional
  `document.modelContext` API.
- `src/index.css` contains global/base styles. `src/App.css` contains the
  page layout, component styles, responsive rules, design tokens, and
  typography.
- `index.html` defines the German document metadata, favicon, root element, and
  the `<webmcp>` host element before loading the TypeScript entry point.

``App.tsx` registers four tools when WebMCP is available:

- `filter_hikes`: validates partial filter input, merges it with the current
  filter state, updates the UI, and returns matching hike summaries. Use it
  only when the user explicitly asks to change visible filters. It is
  registered only while the Entdecken tab is active.
- `recommend_hikes`: applies optional preferences as recommendation criteria,
  ranks matching hikes, stores the results for the separate Inspiration tab,
  and returns matching hike summaries with scores and reasons. It does not
  change the manual filters or switch tabs automatically. Free-form wishes
  belong in `preference`; do not also call `filter_hikes` for a recommendation.
  It is registered only while the Inspiration tab is active.
- `show_recommendation_summary`: accepts one prose explanation per recommended
  hike and displays it directly on the corresponding card in the Inspiration
  tab without switching tabs. It is registered only while the Inspiration tab
  is active.
- `reset_hike_filters`: restores the default filters and returns the total
  number of hikes. Recommendation state remains separate and is cleared from
  the Inspiration tab explicitly.

The registration effect uses an `AbortController` for cleanup. Preserve that
lifecycle behavior when changing tool registration.

## Repository conventions

- Keep domain-facing text in German. Use English names for technical
  identifiers and internal enum values (`Easy`, `Moderate`, `Difficult`).
  Translate those values at the UI boundary.
- Keep filtering behavior consistent between manual controls and WebMCP. The
  `getFilteredHikes` function is the shared source of truth for matching hikes.
- Keep recommendations separate from manual filters. `recommend_hikes` should
  update recommendation state and explain why results match instead of
  silently changing the visible filter controls. The user switches to the
  Inspiration tab manually.
- When adding or changing a filter, update all connected surfaces together:
  `HikeFilterInput`, `hikeFilterInputSchema`, validation in `App.tsx`, React
  state and refs, filter controls and summary chips, reset behavior, and the
  WebMCP response.
- WebMCP inputs are partial updates: unspecified values keep their current
  values. Use `filtersRef` for the current state used by asynchronous tool
  executions, and keep it synchronized with React state.
- Keep the static hike dataset typed as `Hike`; add new records in
  `src/hikes.ts` rather than embedding data in the component.
- Preserve the existing visual system when editing styles: reuse the CSS
  variables in `src/index.css`, the font families already imported there, and
  the component structure/classes in `src/App.css`.
- TypeScript is configured in bundler mode with `noUnusedLocals`,
  `noUnusedParameters`, `noFallthroughCasesInSwitch`, and `noEmit`. Prefer
  type-safe changes that satisfy `npm run build` without suppressions.
