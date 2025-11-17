# Archon Project Structure

## Complete File Listing

```
archon/
├── README.md                          # Main documentation
├── QUICKSTART.md                      # Quick start guide
├── PROJECT_STRUCTURE.md               # This file
├── example-architecture.md            # Sample architecture for testing
├── package.json                       # Root package.json
├── pnpm-workspace.yaml               # Workspace configuration
├── tsconfig.json                      # Root TypeScript config
├── .gitignore                        # Git ignore rules
│
├── packages/
│   ├── shared/                       # Shared TypeScript types
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── src/
│   │   │   ├── index.ts             # Exports all types
│   │   │   └── types.ts             # Core type definitions
│   │   └── dist/                     # Built files (auto-generated)
│   │
│   ├── backend/                      # Fastify API server
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── .env                      # Environment variables (with Groq API key)
│   │   ├── .env.example             # Environment template
│   │   └── src/
│   │       ├── index.ts             # Server entry point
│   │       ├── llm/
│   │       │   ├── client.ts        # Groq LLM client implementation
│   │       │   └── prompts.ts       # LLM prompt builders (3 stages)
│   │       ├── services/
│   │       │   ├── parser.ts        # Architecture document parser
│   │       │   ├── review.ts        # Review service (3-stage pipeline)
│   │       │   └── storage.ts       # In-memory storage
│   │       └── routes/
│   │           └── reviews.ts       # API endpoints
│   │
│   └── frontend/                     # Next.js web application
│       ├── package.json
│       ├── tsconfig.json
│       ├── next.config.js
│       ├── .env.local               # Frontend environment variables
│       ├── .env.local.example       # Environment template
│       └── src/
│           └── app/
│               ├── layout.tsx       # Root layout
│               ├── page.tsx         # Main review UI
│               └── globals.css      # Styles
```

## Key Files Explained

### Configuration Files

- **pnpm-workspace.yaml**: Defines the monorepo workspace with 3 packages
- **tsconfig.json**: Base TypeScript configuration inherited by all packages
- **package.json**: Root dependencies and scripts

### Shared Package

- **types.ts**: All TypeScript interfaces used across backend and frontend
  - `ReviewRequest`, `ArchitectureInput`, `ArchitectureModel`
  - `ArchitectureIssue`, `CodeProfile`, `ArchitectureReview`

### Backend Package

#### LLM Module
- **client.ts**: `GroqLLMClient` implementing the `LLMClient` interface
  - Uses `groq-sdk` for API calls
  - Configurable model (default: llama-3.1-70b-versatile)

- **prompts.ts**: Three prompt builder functions
  1. `buildExtractionPrompt()` - Extract ArchitectureModel
  2. `buildIssueDetectionPrompt()` - Detect architecture issues
  3. `buildReportGenerationPrompt()` - Generate Markdown report

#### Services Module
- **parser.ts**: Parses architecture documents
  - Extracts sections by markdown headings
  - Identifies PlantUML and Mermaid diagrams

- **review.ts**: `ReviewService` - main business logic
  - `extractArchitectureModel()` - Stage 1
  - `detectIssues()` - Stage 2
  - `generateReport()` - Stage 3
  - `performReview()` - Full pipeline

- **storage.ts**: `ReviewStorage` - in-memory Map storage
  - Easy to swap with database implementation

#### Routes Module
- **reviews.ts**: Fastify route handlers
  - `POST /api/reviews` - Create review
  - `GET /api/reviews/:id` - Get review by ID
  - `GET /api/reviews` - List all reviews

#### Entry Point
- **index.ts**: Fastify server setup
  - CORS configuration
  - Service initialization
  - Route registration
  - Server startup

### Frontend Package

- **page.tsx**: Main UI component
  - Form for submitting architecture text and repo URL
  - Loading state management
  - Review results display with:
    - Summary
    - Component list
    - Issues with severity badges
    - Full Markdown report

- **layout.tsx**: Next.js root layout with metadata

- **globals.css**: Complete styling
  - Form styles
  - Issue card styles with severity colors
  - Markdown rendering styles
  - Responsive design

- **next.config.js**: Next.js configuration
  - Transpiles `@archon/shared` for proper monorepo support

## Environment Variables

### Backend (.env)
```
GROQ_API_KEY=gsk_...              # Your Groq API key (configured)
PORT=3001                          # Backend server port
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001   # Backend API URL
```

## Dependencies

### Shared
- No runtime dependencies (types only)

### Backend
- `fastify` - Web framework
- `@fastify/cors` - CORS support
- `groq-sdk` - Groq API client
- `nanoid` - ID generation
- `tsx` - TypeScript execution for dev

### Frontend
- `next` - Next.js framework
- `react` & `react-dom` - React libraries
- `react-markdown` - Markdown rendering

## NPM Scripts

### Root Level
```bash
pnpm dev          # Run all packages in parallel
pnpm build        # Build all packages
pnpm lint         # Lint all packages
```

### Backend
```bash
pnpm dev          # Start dev server with hot reload
pnpm build        # Build TypeScript
pnpm start        # Start production server
```

### Frontend
```bash
pnpm dev          # Start Next.js dev server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run Next.js linter
```

### Shared
```bash
pnpm build        # Build TypeScript types
pnpm dev          # Watch mode for types
```

## API Flow

```
User (Browser)
    ↓
Next.js Frontend (localhost:3000)
    ↓ POST /api/reviews
Fastify Backend (localhost:3001)
    ↓
ReviewService.performReview()
    ├─→ parseArchitectureDocument()
    ├─→ extractArchitectureModel()  ──→ Groq API (Stage 1)
    ├─→ detectIssues()              ──→ Groq API (Stage 2)
    └─→ generateReport()            ──→ Groq API (Stage 3)
    ↓
ReviewStorage.save()
    ↓
Return ArchitectureReview
    ↓
Frontend displays results
```

## LLM Pipeline Stages

### Stage 1: Model Extraction
**Input:** Raw architecture text with sections and diagrams
**Output:** Structured `ArchitectureModel` JSON
**Prompt:** Instructs LLM to identify components, dependencies, and concerns

### Stage 2: Issue Detection
**Input:** `ArchitectureModel` + optional `CodeProfile`
**Output:** Array of `ArchitectureIssue` objects
**Prompt:** Analyzes for scalability, security, reliability, etc.

### Stage 3: Report Generation
**Input:** `ArchitectureModel` + detected issues
**Output:** Executive summary + recommendations + full Markdown report
**Prompt:** Generates professional architecture review document

## Extending the System

### Add New LLM Provider
1. Implement `LLMClient` interface in `backend/src/llm/client.ts`
2. Update initialization in `backend/src/index.ts`

### Add Database Storage
1. Create new class implementing `ReviewStorage` interface
2. Replace `new ReviewStorage()` in `backend/src/index.ts`

### Add GitHub Repo Analysis
1. Implement repo cloning and analysis logic
2. Generate `CodeProfile` object
3. Pass to `reviewService.performReview()` as second parameter

### Customize Prompts
Edit the prompt builders in `backend/src/llm/prompts.ts`:
- Modify system messages for different analysis styles
- Adjust temperature and max tokens in `backend/src/services/review.ts`

## Testing

Currently no automated tests. To test manually:

1. Start both servers: `pnpm dev`
2. Open http://localhost:3000
3. Paste `example-architecture.md` content
4. Submit and verify results

To test API directly:
```bash
curl -X POST http://localhost:3001/api/reviews \
  -H "Content-Type: application/json" \
  -d '{"architectureText": "# My Architecture\n..."}'
```

## Next Development Steps

1. Add error boundaries in frontend
2. Implement loading progress indicators
3. Add review history page
4. Implement GitHub repo analysis
5. Add automated tests (Jest/Vitest)
6. Set up CI/CD pipeline
7. Add user authentication
8. Implement persistent storage
9. Add WebSocket for real-time updates
10. Create API documentation (OpenAPI/Swagger)
