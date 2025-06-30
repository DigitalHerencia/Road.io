# Contributing to Road.io

Thank you for your interest in contributing! This project is optimized for both human and LLM agent collaboration. Please follow these guidelines to ensure a smooth contribution process.

## Getting Started
1. **Clone the repository** and run `agents-setup.ps1` to initialize the environment.
2. **Install dependencies** (if not skipped by the setup script).
3. **Copy and configure environment variables:**
   - Copy `agents/.env.example` to `agents/.env` and fill in required secrets.
4. **Review architecture:**
   - Read `INSTRUCTIONS.md`, `Features.md`, and `main/FEATURE_ARCHITECTURE.md`.

## Branching & PRs
- **Branch naming:** Use `type/description-kebab-case` (e.g., `feature/driver-dashboard`).
- **PR title:** `type: description` (min 10 chars).
- **PR description:**
  - Closing keywords (e.g., `Closes #123`)
  - Dependencies/blocks
  - Impact summary
  - Checklist ([ ] Passes CI, [ ] Updates docs, [ ] Notifies milestone)
- **Automation:** PRs that do not follow conventions will be rejected.

## Code Standards
- Follow the rules in `INSTRUCTIONS.md`.
- Use TypeScript 5+, React 19, Next.js 15, Tailwind 4, Drizzle ORM, and Clerk Auth as per project stack.
- Place all business logic in `lib/`, UI in `components/`, and feature modules in `features/`.
- Write tests for all critical logic.
- Document all significant changes.

## Review & Merging
- All PRs require review by code owners or designated agent roles.
- No auto-merges; reviews are mandatory.
- Use the provided PR template.

## Additional Resources
- See `.github/workflows/conventions.yml` for automation rules.
- See `agents/README.md` for agent orchestration usage.

---

**Thank you for contributing to Road.io!**
