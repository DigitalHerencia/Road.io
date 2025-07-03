# Road.io - Modern Full-Stack Web Application

A modern web application built with the latest technologies including Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui, Clerk Authentication, and Neon PostgreSQL.

## 🚀 Tech Stack

- **Framework:** Next.js 15 with App Router and Turbopack
- **Frontend:** React 19 + TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui with Radix UI primitives
- **Authentication:** Clerk (OAuth, Magic Links, Passwords)
- **Database:** Neon PostgreSQL (Serverless)
- **ORM:** Drizzle ORM
- **Validation:** Zod
- **Development:** ESLint + TypeScript

## 🛠️ Setup & Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Neon PostgreSQL database

### Installation

1. **Clone and navigate to the project:**
   ```bash
   cd main
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create `.env.local` file with your database and authentication credentials:
   ```env
   # Database
   DATABASE_URL="your-neon-database-url"
   
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your-clerk-publishable-key"
   CLERK_SECRET_KEY="your-clerk-secret-key"
   CLERK_WEBHOOK_SECRET="your-webhook-secret"
   
   # Next.js
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Database Setup:**
   ```bash
   # Generate migration files
   npm run db:generate

   # Run migrations
   npm run db:migrate

   # Push schema to database
   npm run db:push
   
   # Open Drizzle Studio (optional)
   npm run db:studio
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
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
);
```

### Posts Table
```sql
CREATE TABLE "posts" (
  "id" serial PRIMARY KEY,
  "title" varchar(255) NOT NULL,
  "content" text,
  "published" boolean DEFAULT false NOT NULL,
  "author_id" serial NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  FOREIGN KEY ("author_id") REFERENCES "users"("id")
);
```

## 🔌 API Endpoints

### Users API
- `GET /api/users` - Get all users
- `POST /api/users` - Create a new user

### Authentication API
- `GET /api/protected` - Protected endpoint (requires authentication)
- `POST /api/protected` - Protected data processing (requires authentication)

### Database Test API
- `GET /api/test-db` - Test database connection
- `POST /api/test-db` - Create a test user

### Webhooks
- `POST /api/webhooks/clerk` - Clerk user events webhook

## 🎨 UI Components

Pre-installed shadcn/ui components:
- **Button** - Various button styles and sizes
- **Card** - Card container with header, content sections
- **Input** - Form input field
- **Label** - Form label component

### Adding More Components

```bash
# Add individual components
npx shadcn@latest add dropdown-menu
npx shadcn@latest add dialog
npx shadcn@latest add form

# Add multiple components
npx shadcn@latest add button card input label dropdown-menu
```

## 📝 Available Scripts

```bash
# Development
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npm run db:generate  # Generate migration files
npm run db:migrate   # Run migrations
npm run db:push      # Push schema changes
npm run db:studio    # Open Drizzle Studio
```

## 🔧 Configuration

### Tailwind CSS
- Configured with shadcn/ui color scheme (Neutral)
- CSS variables for theming
- Custom utility classes available

### TypeScript
- Strict mode enabled
- Path mapping configured (`@/` for `src/`)
- Type-safe database operations with Drizzle

### Database
- Serverless Neon PostgreSQL
- Connection pooling enabled
- SSL required for security

## 🚀 Features

- ✅ Server and Client Components
- ✅ TypeScript with strict mode
- ✅ Responsive design with Tailwind CSS
- ✅ Database integration with Drizzle ORM
- ✅ Complete authentication with Clerk
- ✅ Protected routes and API endpoints
- ✅ User management and webhooks
- ✅ API routes with validation
- ✅ Modern UI components
- ✅ Development with Turbopack
- ✅ ESLint configuration
- ✅ Environment variable support
- ✅ Company profile management settings

## 🔐 Authentication Setup

This application uses Clerk for authentication. Here's what's included:

### Features
- **Multiple sign-in methods:** Email/password, OAuth (Google, GitHub, etc.), magic links
- **User management:** Complete user profiles and session management  
- **Protected routes:** Middleware-based route protection
- **API authentication:** Server-side authentication for API routes
- **Webhooks:** Automated user sync with your database

### Pages & Components
- **Home page:** Authentication status and sign-in prompt
- **Dashboard:** Protected page demonstrating authenticated content
- **User button:** Complete user management interface
- **Auth testing:** Interactive API authentication testing

### Configuration
1. **Clerk Dashboard:** Set up your application at [clerk.com](https://clerk.com)
2. **Environment variables:** Add your Clerk keys to `.env.local`
3. **Webhooks:** Configure webhook endpoint: `https://yourdomain.com/api/webhooks/clerk`
4. **Middleware:** Routes matching `/dashboard/*`, `/profile/*`, `/admin/*` are automatically protected

### Testing Authentication
1. Visit the home page and sign in
2. Access the protected dashboard at `/dashboard`
3. Test API authentication using the interactive testing component
4. Check webhook integration by monitoring user creation events

## 🧪 Testing Database Connection

The application includes a built-in database testing interface:

1. Visit the home page at `http://localhost:3000`
2. Use the "Database Connection Test" card to:
   - Test the connection to Neon PostgreSQL
   - View existing users
   - Create new users
   - Validate the full stack integration

## 📖 Next Steps

1. **Authentication:** Add NextAuth.js for user authentication
2. **API Extensions:** Build more comprehensive API endpoints
3. **UI Enhancements:** Add more shadcn/ui components
4. **Testing:** Add Jest and React Testing Library
5. **Deployment:** Deploy to Vercel or your preferred platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.
