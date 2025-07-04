# Code Structure & Style Guide

This document provides an overview of the project layout and summarizes the style standards used throughout **Road.io**. These guidelines complement the details in [AGENTS.md](AGENTS.md) and the wiki.

## Directory Overview

All implementation code lives under [`main/src`](main/src):

- **`app/`** – Next.js App Router routes, layouts, and server components.
- **`components/`** – Reusable UI components without side effects.
- **`features/`** – Feature modules grouped by domain (`admin`, `dispatch`, `vehicles`, etc.).
- **`lib/`** – Server actions, fetchers, schemas, and utilities.
- **`types/`** – Shared TypeScript types and interfaces.
- **`public/`** – Static assets such as images and fonts.
- **`config/`** – Project configuration files.

Business logic should be implemented in server actions within `lib/actions` and validated with Zod. API routes are reserved only for authentication, webhooks, or public integrations.

## Style Guidelines

Road.io follows a feature-driven approach with a strict TypeScript configuration. Key rules include:

- Prefer **server-first rendering** using React Server Components.
- Use client components only when local state or browser APIs are required.
- Organize code by feature and domain.
- Validate all input using Zod schemas.
- Keep modules small and composable.
- Enable `strict` mode in TypeScript and avoid the use of `any`.
- Use Tailwind CSS utility classes and design tokens for styling.
- Document significant changes and update docs alongside code.

Additional standards—such as testing strategy, API route usage, and deployment practices—are outlined in [wiki/Development-Standards.md](wiki/Development-Standards.md).

## Contributing

Before opening a pull request, run the following commands from the `main` directory:

```bash
npm run lint
npm run typecheck
npm run test
```

For more detailed contributor guidelines, see [CONTRIBUTING.md](CONTRIBUTING.md) and [AGENTS.md](AGENTS.md).

