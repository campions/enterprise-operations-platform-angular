# Enterprise Ops Dashboard (Angular)

An Angular 21 standalone workspace that demonstrates a scalable front-end architecture for data-heavy enterprise dashboards. The project highlights:

- **Feature-first architecture:** Standalone routes (`app.routes.ts`) lazy-load self-contained Dashboard, Table View, and Configuration pages that share layout, state, and utility layers.
- **Data-heavy UI patterns:** Signals-driven table workflows (`TableViewComponent`) apply filter/sort/pagination utilities and surface resilient loading/error/empty states.
- **Wrapper design system:** All Material controls flow through `src/app/core/ui` wrappers (button, card, table, modal, toast, etc.) to enforce consistent APIs, theming, `data-testid` hooks, and accessibility.
- **Strict TypeScript + testing:** `tsconfig` runs in strict mode (no `any`) and Jest + `@testing-library/angular` verify table utilities plus feature behaviors (loading states, filtering, form validation, snackbars).

## Prerequisites

- Node.js 20.11+ and npm 10.2+
- Internet access to install packages once (`npm install`)

## Running the dev server

```bash
npm install
npm start
```

`ng serve` hosts the app at `http://localhost:4200/` with live reload and strict TypeScript compilation.

## Running the tests

Jest is configured in `jest.config.ts` with `@testing-library/angular` helpers.

```bash
npm test
```

Use `npm run test:watch` for an interactive loop during UI development.

## Folder structure

```
src/
  main.ts                  # Bootstrap with provideRouter + Material providers
  styles.scss              # Global Angular Material theme (SCSS)
  app/
    app.routes.ts          # Standalone route table
    app.component.*        # Shell layout (sidenav + toolbar)
    core/
      layout/              # Navigation config
      ui/                  # Design-system wrappers (button/card/input/table/modal/toast/…)
      states/              # Loading/empty/error components + signal helpers
      data/                # Deterministic mocks + simulated services
      utils/               # Pure helpers (e.g., table-utils + specs)
    features/
      dashboard/           # KPI grid + recent updates table
      table-view/          # Full CRUD-like table with modals
      configuration/       # Reactive form + toast feedback
    tests/                 # Feature-level Testing Library specs
  test-setup.ts            # Jest + Angular testing initialization
```

## Development standards

- Strict TypeScript with no implicit `any`; prefer signals and strongly typed interfaces for UI/data flows.
- All UI surfaces must use the wrapper components to inherit accessibility, theming, and `data-testid` contracts.
- Network/data latency is simulated in services via RxJS `delay`, so tests should control timers when asserting async behavior.
