# Road.io

Road.io is a feature-driven fleet management platform built with Next.js 15 and React 19. It uses a server-first approach with server actions and Zod validation to keep the codebase type-safe and maintainable.

## Tech Stack

- **Framework:** Next.js 15 App Router
- **Language:** TypeScript 5 + React 19
- **UI:** Tailwind CSS 4 with shadcn/ui
- **Auth:** Clerk
- **Database:** Neon Postgres with Drizzle ORM
- **Validation:** Zod

## Setup

1. **Install dependencies**
   ```bash
   cd main
   npm install
   ```
2. **Configure environment variables** – copy `.env.example` to `.env.local` and add your database and Clerk keys.
3. **Run database migrations**
   ```bash
   npm run db:push
   ```
4. **Start the dev server**
   ```bash
   npm run dev
   ```

## Project Structure

```text
main/
├── src/
│   ├── app/        # Next.js routes and layouts
│   ├── features/   # Domain modules (admin, dispatch, vehicles, ...)
│   ├── lib/        # Fetchers, server actions, schema
│   ├── components/ # Shared UI components
│   └── types/      # Shared TypeScript types
├── public/         # Static assets
└── tests/          # Vitest suites
```

Business logic lives in **server actions** under `lib/actions/`. API routes are reserved for authentication, webhooks and public integrations.

## Testing

Run these commands from the `main` directory:

```bash
npm run lint
npm run typecheck
npm run test
```

## Documentation

User-facing guides and module details are available in [Features.md](Features.md) and the [project wiki](wiki/Home.md).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) and [AGENTS.md](AGENTS.md) for coding standards and PR conventions.

## License

This project is licensed under the MIT License.
