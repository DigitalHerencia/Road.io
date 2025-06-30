# Development Standards

This page summarizes the coding, architectural, and contribution standards for Road.io. All contributors and LLM agents should follow these rules.

## Modern Fullstack Project Rules (Next.js 15 Stack)

- **Server-first rendering:** Use React Server Components by default.
- **Client components:** Only use `"use client"` when necessary.
- **Feature-driven architecture:** Organize by feature/domain, not technical type.
- **Modularity:** Write small, composable, reusable modules.

## Project Structure

- `app/`: Next.js App Router (routes, layouts, server components)
- `components/`: Pure, reusable UI components
- `features/`: Feature modules (UI + logic)
- `lib/`: Domain logic, fetchers, server actions, utilities
- `styles/`: Tailwind CSS, global styles
- `types/`: Shared TypeScript types
- `public/`: Static assets
- `config/`: Config files

## Data Fetching

- Use server components for data fetching by default.
- Place fetchers in `lib/fetchers/` by domain.
- All fetchers must be async and typed.
- Reuse fetchers; avoid duplication.

## Mutations & Forms

- Place all mutations in `lib/actions/` with `'use server'`.
- Use Zod or equivalent for validation.
- Use `useActionState()` and `useFormStatus()` for form state.

## API Routes

- Use `/app/api/*` only for auth, webhooks, 3rd-party, or public APIs.
- CRUD/business logic: use server actions, not API routes.

## Tailwind CSS 4

- Use CSS variables for design tokens.
- Enable dark mode with `darkMode: 'class'`.
- Prefer utility classes over custom CSS.

## React 19 Usage

- Use `useOptimistic()` for previews.
- Use `useTransition()` for async state.
- Prefer `use()` for loading data in server components.

## TypeScript 5 Best Practices

- Use `satisfies` for config validation.
- Enable `strict` mode.
- Avoid `any` and unsafe assertions.

## Testing & Maintainability

- Write reusable code.
- Separate UI, logic, and pages.
- Document all systems and configs.
- Write unit/integration tests for critical logic.

## Production Readiness

- Always generate production-ready, complete code.
- Implement full business logic, validation, and error handling.
- Include all required imports, types, and config.
- Validate and test all flows before completion.

## GitHub PR & Branch Standards

- **Branch naming:** `type/description-kebab-case` (e.g., `feature/client-management`)
- **PR title:** `type: description` (min 10 chars)
- **PR description:** Closing keywords, dependencies, impact summary, checklist
- **Automation:** Conventions enforced by `.github/workflows/conventions.yml`

---

**For LLM agents:**
Follow these standards for all code, documentation, and contributions.

[Back to Home](Home.md)
