# AGENTS.md — LLM Agent Contributor Guide

## Overview
- Work in `main/src/`:
  - `app/` — Next.js routes and layouts
  - `features/` — Domain modules (admin, dispatch, vehicles, ...)
  - `lib/` — Fetchers, server actions, schema and utilities
  - `components/` — Reusable UI pieces
  - `types/` — Shared TypeScript types
  - `public/` — Static assets
  - `config/` — Configuration files
- Keep business logic in **server actions** under `lib/actions/`. Use API routes only for auth, webhooks or public integrations.

## Contribution & Style Guidelines
- Follow [README.md](README.md) and [CONTRIBUTING.md](CONTRIBUTING.md).
- Prefer server-first rendering with React Server Components.
- Organize code by feature/domain.
- Use TypeScript strict mode and validate all inputs with Zod.
- Document significant changes and keep feature docs up to date.

## Validation & Testing
Run these commands from the `main` folder and resolve any errors:

```bash
npm run lint
npm run typecheck
npm run test
```

## How to Present Work
- Include docs updates with code changes when possible.
- PRs must follow repository conventions and reference an issue.
- See `CODEOWNERS` for required reviewers.

## Additional Resources
- [FEATURE_ARCHITECTURE.md](FEATURE_ARCHITECTURE.md)
- [wiki/Home.md](wiki/Home.md) — user-facing guides and FAQs.
