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
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── users/         # User CRUD operations
│   │   │   ├── protected/     # Protected API endpoint
│   │   │   ├── test-db/       # Database connection test
│   │   │   └── webhooks/      # Clerk webhooks
│   │   │       └── clerk/     # Clerk user events
│   │   ├── dashboard/         # Protected dashboard page
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout with ClerkProvider
│   │   └── page.tsx           # Home page
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── AuthSection.tsx   # Authentication status display
│   │   ├── AuthTest.tsx      # API authentication testing
│   │   └── DatabaseTest.tsx   # Database testing component
│   ├── features/              # Feature modules grouped by domain
│   │   ├── drivers/          # Driver management UI and logic
│   │   └── ...               # Other domain folders
│   ├── lib/                   # Utilities and configurations
│   │   ├── db.ts             # Database connection
│   │   ├── db-utils.ts       # Database utility functions
│   │   ├── schema.ts         # Database schema
│   │   └── utils.ts          # General utilities
│   └── middleware.ts          # Clerk route protection
├── drizzle/                   # Database migrations
├── public/                    # Static assets
├── .env.local                # Environment variables
├── components.json           # shadcn/ui configuration
├── drizzle.config.ts         # Drizzle ORM configuration
└── package.json              # Dependencies and scripts
```

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE "users" (
  "id" serial PRIMARY KEY,
  "email" varchar(255) NOT NULL UNIQUE,
  "name" varchar(255),
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL

```

Business logic lives in **server actions** under `lib/actions/`. API routes are reserved for authentication, webhooks and public integrations.

For a deeper look at the repository layout and style conventions, see [CODE_STRUCTURE.md](CODE_STRUCTURE.md).

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

