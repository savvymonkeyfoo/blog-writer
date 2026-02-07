# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this codebase.

## Project Overview

LinkedIn Thought Leadership Blog System - A content creation studio for generating, researching, and publishing blog posts. The main application is a Next.js 16 app located in the `/studio` directory.

## Project Structure

```
/studio          - Main Next.js application
  /app           - Next.js App Router pages and actions
    /actions     - Server actions
  /components    - React components organized by feature
    /ui          - Reusable UI components (Radix-based)
    /ideation    - Idea generation components
    /research    - Research workflow components
    /review      - Content review components
    /writing     - Writing/editing components
  /lib           - Shared utilities
    /ai          - AI provider configurations
    /db          - Database schema and queries (Drizzle ORM)
  /skills        - Custom skills/workflows
/output          - Generated content output
```

## Development Commands

All commands should be run from the `/studio` directory:

```bash
cd studio
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build
npm run lint     # Run ESLint
```

## Tech Stack

- **Framework**: Next.js 16 with App Router, React 19
- **Styling**: Tailwind CSS v4 with @tailwindcss/postcss
- **UI Components**: Radix UI primitives, Lucide icons
- **Database**: SQLite via better-sqlite3, Drizzle ORM
- **AI Integration**: Vercel AI SDK with multiple providers:
  - Anthropic (Claude)
  - OpenAI
  - Google Generative AI
  - Azure OpenAI
- **Auth/Backend**: Supabase (SSR client)
- **Testing**: Vitest, Testing Library, Playwright
- **Animation**: Framer Motion

## Environment Variables

Copy `.env.example` to `.env.local` and configure:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `OPENAI_API_KEY` - OpenAI API key
- `ANTHROPIC_API_KEY` - Anthropic API key
- `GOOGLE_GENERATIVE_AI_API_KEY` - Google AI key
- `PERPLEXITY_API_KEY` - Perplexity API key

## Key Patterns

- Server actions are in `/app/actions/`
- AI provider logic is in `/lib/ai/`
- Database operations use Drizzle ORM with SQLite (`local.db`)
- UI components follow Radix UI patterns with shadcn/ui styling
- Use `next-themes` for dark mode support

## Testing

```bash
cd studio
npx vitest           # Run unit tests
npx playwright test  # Run E2E tests
```

### Testing UI Changes

**CRITICAL**: When making UI/UX changes, ALWAYS verify them before marking as complete:

1. **Visual Verification**: Check the running dev server (localhost:3000) to verify changes render correctly
2. **Cross-browser**: Test in Chrome/Firefox if significant visual changes
3. **Responsive**: Check mobile and desktop views for layout changes
4. **Automated Tests**: Run or write Playwright tests for critical UI components when possible
5. **Manual Inspection**: Use browser DevTools to verify:
   - Computed styles match expected values
   - Colors are rendering correctly (#0A1628 = rgb(10, 22, 40))
   - Text is readable with sufficient contrast
   - Animations/transitions work smoothly

Never tell the user a UI change is complete without verifying it actually works as intended.
