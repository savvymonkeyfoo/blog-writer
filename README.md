# Blog Writer

A LinkedIn Thought Leadership Blog System - A comprehensive content creation studio for generating, researching, and publishing professional blog posts.

## Overview

Blog Writer is a Next.js 16 application that streamlines the entire blog creation workflow, from ideation through research, writing, and review. Built with modern AI capabilities and a clean, intuitive interface.

## Features

- **AI-Powered Content Generation**: Integrate with multiple AI providers (Claude, OpenAI, Google AI)
- **Research Workflow**: Built-in research tools and workflows
- **Content Review**: Collaborative review and editing capabilities
- **Modern UI**: Clean interface built with Radix UI and Tailwind CSS v4
- **Database Integration**: SQLite database with Drizzle ORM
- **Dark Mode**: Built-in theme support with next-themes

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

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/savvymonkeyfoo/blog-writer.git
cd blog-writer
```

2. Install dependencies:
```bash
cd studio
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your API keys:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `OPENAI_API_KEY` - OpenAI API key
- `ANTHROPIC_API_KEY` - Anthropic API key
- `GOOGLE_GENERATIVE_AI_API_KEY` - Google AI key
- `PERPLEXITY_API_KEY` - Perplexity API key

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development

### Available Commands

All commands should be run from the `/studio` directory:

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build
npm run lint     # Run ESLint
npm run test     # Run unit tests with Vitest
npm run test:e2e # Run end-to-end tests with Playwright
```

### Testing

```bash
cd studio
npx vitest           # Run unit tests
npx playwright test  # Run E2E tests
```

## Key Patterns

- Server actions are in `/app/actions/`
- AI provider logic is in `/lib/ai/`
- Database operations use Drizzle ORM with SQLite (`local.db`)
- UI components follow Radix UI patterns with shadcn/ui styling
- Dark mode support via `next-themes`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is private and proprietary.

## Support

For issues and questions, please open an issue on GitHub.
