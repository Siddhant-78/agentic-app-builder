# Nexa

> Turn a product idea into a working web app with one prompt.

Nexa is an AI-powered app builder for moving from a rough idea to an editable, exportable application. Describe what you want to build, iterate with an AI workspace, inspect the generated preview and code, then download the project when it is ready.

![Nexa dark SaaS interface](public/background.png)

## Why Nexa?

Building a small product usually means jumping between a blank editor, documentation, a design tool, and a terminal. Nexa brings that first creative loop into one workspace:

- **Prompt-to-app workflow**: describe an idea in natural language and generate a starting point.
- **Conversational iteration**: ask the AI to refine the generated application.
- **Live preview and code**: move between the rendered app and its generated files.
- **Project history**: save workspaces and return to previous ideas.
- **Image uploads**: add visual assets through Supabase Storage.
- **Exportable output**: download a generated project as a ZIP archive.
- **Usage-aware plans**: track credits and support free, starter, and pro plans through Clerk.
- **Responsive dark SaaS UI**: focused interface with interactive gravity-star backgrounds and a Nexa identity.

## Product flow

```text
Idea -> Prompt -> Generated workspace -> Chat-driven iteration -> Preview / Code -> Export
```

## Tech stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS 4, shadcn/ui, Motion |
| AI | Google Gemini via `@google/genai` |
| Authentication and billing | Clerk |
| Database | PostgreSQL with Prisma 7 |
| File storage | Supabase Storage |
| Code preview | Sandpack |
| Deployment | Vercel-compatible Next.js deployment |

## Getting started

### Prerequisites

- Node.js 20 or newer
- npm
- A PostgreSQL database
- A Clerk application
- A Google Gemini API key
- A Supabase project if image uploads are needed

### 1. Clone and install

```bash
git clone https://github.com/<your-account>/<your-repository>.git
cd agentic-app-builder
npm install
```

### 2. Configure environment variables

Create a `.env` or `.env.local` file in the project root:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Database
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require

# AI generation
GEMINI_API_KEY=...

# Supabase image uploads
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
```

Keep secret keys server-side and never commit `.env` or `.env.local` to GitHub. The Supabase service role key must not be exposed to the browser.

### 3. Prepare the database

Apply the checked-in Prisma migrations:

```bash
npx prisma migrate deploy
```

For local schema development, regenerate the Prisma client after schema changes:

```bash
npx prisma generate
```

### 4. Start Nexa

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available scripts

```bash
npm run dev       # Start the development server
npm run lint      # Run ESLint
npm run build     # Create a production build
npm run start     # Start the production server
```

## Project structure

```text
app/
	(auth)/          Clerk sign-in and sign-up routes
	(main)/          Authenticated projects and workspace routes
	api/             AI generation and image upload endpoints
	page.tsx         Nexa landing page and prompt entry point
actions/           Server actions for projects and workspaces
components/        Shared UI, chat, code, preview, and motion components
lib/               Database client, constants, utilities, and generated Prisma client
prisma/            Prisma schema and database migrations
public/            Static assets, including the Nexa mark
types/             Shared TypeScript contracts
```

## Architecture notes

- Authentication is enforced with Clerk at the route and server-action boundaries.
- User accounts and generated workspaces are stored in PostgreSQL through Prisma.
- Gemini generation runs behind the `/api/gen-ai-code` server route.
- Image uploads run behind `/api/upload-image` and use Supabase Storage.
- Generated files are rendered in the workspace and can be exported client-side as a ZIP.

## Deployment

Nexa can be deployed to Vercel or another Next.js-compatible host:

1. Import the repository into your hosting provider.
2. Add the environment variables listed above.
3. Configure the production URL in Clerk and Supabase.
4. Run the production build during deployment with `npm run build`.
5. Apply production migrations with `npx prisma migrate deploy`.

Do not place `GEMINI_API_KEY`, `CLERK_SECRET_KEY`, `DATABASE_URL`, or `SUPABASE_SERVICE_ROLE_KEY` in client-exposed environment variables.

## Contributing

Contributions are welcome. A focused workflow helps keep changes easy to review:

1. Create a feature branch.
2. Make the smallest focused change that solves the problem.
3. Run `npm run lint` and `npm run build`.
4. Open a pull request with the user-facing behavior and verification steps.

