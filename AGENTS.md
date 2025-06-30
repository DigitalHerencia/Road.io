# AGENTS.md — LLM Agent Contributor Guide

## Overview
- **Work in these folders:**
  - `main/app/` — Next.js App Router (routes, layouts, server/server components)
  - `main/components/` — Pure, reusable UI components
  - `main/features/` — Feature modules (UI + logic)
  - `main/lib/` — Domain logic, fetchers, server actions, utilities
  - `main/types/` — Shared TypeScript types
  - `main/public/` — Static assets
  - `main/config/` — Configuration files
- **Do not place business logic in `/app/api/*` except for auth, webhooks, or 3rd-party integrations.**

## Contribution & Style Guidelines
- Follow the rules in `README.md` and `CONTRIBUTING.md`.
- Use server-first rendering and React Server Components by default.
- Organize code by feature/domain, not by technical type.
- Use TypeScript 5+ strict mode, no `any` or unsafe assertions.
- Place all mutations in `lib/actions/*.ts` with `'use server'`.
- Validate all inputs with Zod or equivalent schemas.
- Use Tailwind CSS 4 with design tokens and utility classes.
- Write production-ready, complete code—no stubs or mock data.
- Document all significant changes and update docs as needed.

## Migration Notes
- If migrating code, update references in `main/features/`, `main/lib/`, and `main/types/`.
- Remove or refactor any legacy code not following the above structure.

## Validation & Testing
- Run `npm run lint` and `npm run typecheck` from the `main/` directory.
- Run all tests: `npm run test` or `npm run test:all` (see CI in `.github/workflows`).
- Fix all lint, type, and test errors before submitting a PR.
- Add or update tests for any code you change.
- After moving files or changing imports, run `npm run lint` and `npm run typecheck` again.

## How to Present Work
- Explore context in the relevant feature, lib, and types folders before making changes.
- Write or update documentation in the same PR as code changes when possible.
- Format PR messages as required by automation:
  - **Title:** `type: description` (min 10 chars, e.g., `feat: add driver dashboard`)
  - **Description:**
    - Closing keywords (e.g., `Closes #123`)
    - Dependencies/blocks
    - Impact summary
    - Checklist ([ ] Passes CI, [ ] Updates docs, [ ] Notifies milestone)
- Reference the correct code owners for review (see `CODEOWNERS`).

## Additional Agent Instructions
- Prefer server actions and feature-driven architecture.
- Use the async params pattern for Next.js 15 pages.
- Always clarify ambiguous requirements before generating code.
- When in doubt, check `FEATURE_ARCHITECTURE.md`, `CONTRIBUTING.md`, and this file.
