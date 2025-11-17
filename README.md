# Archon - AI Architecture Reviewer

An AI-powered architecture review tool that analyzes software architecture documents and provides detailed, actionable feedback.

## Features

- **3-Stage LLM Analysis Pipeline**:
  1. Extract structured architecture model from documents
  2. Detect issues across 6 categories (scalability, reliability, security, data, observability, devex)
  3. Generate comprehensive Markdown reports

- **Tech Stack**:
  - Backend: Fastify + TypeScript
  - Frontend: Next.js 14 (App Router) + React
  - LLM: Groq (fast inference with multiple models: Llama 3.3 70B, Llama 3.1 8B, Qwen3 32B, GPT-OSS 120B)
  - Monorepo: pnpm workspaces

## Project Structure

```
archon/
├── packages/
│   ├── shared/          # Shared TypeScript types
│   ├── backend/         # Fastify API server
│   │   ├── src/
│   │   │   ├── llm/           # Groq client & prompts
│   │   │   ├── services/      # Review pipeline & storage
│   │   │   ├── routes/        # API endpoints
│   │   │   └── index.ts
│   └── frontend/        # Next.js web UI
│       ├── src/app/
│       │   ├── page.tsx       # Main review UI
│       │   └── layout.tsx
└── pnpm-workspace.yaml
```

## Setup

### Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`)
- Groq API key (get one at https://console.groq.com)

### Installation

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Build shared types**:
   ```bash
   cd packages/shared
   pnpm build
   ```

3. **Configure backend**:
   ```bash
   cd packages/backend
   cp .env.example .env
   # Edit .env and add your GROQ_API_KEY
   ```

4. **Configure frontend**:
   ```bash
   cd packages/frontend
   cp .env.local.example .env.local
   # Edit .env.local if needed (defaults to http://localhost:3001)
   ```

### Running the Application

#### Option 1: Run everything in parallel (from root)
```bash
pnpm dev
```

#### Option 2: Run separately

**Terminal 1 - Backend:**
```bash
cd packages/backend
pnpm dev
```

**Terminal 2 - Frontend:**
```bash
cd packages/frontend
pnpm dev
```

- Backend API: http://localhost:3001
- Frontend UI: http://localhost:3000

## Usage

1. Open http://localhost:3000
2. Paste your architecture document (Markdown format) into the textarea
3. Select your preferred AI model (each has separate rate limits):
   - **Llama 3.3 70B** - Default, fastest, most balanced
   - **Llama 3.1 8B** - Faster inference, smaller model
   - **Qwen3 32B** - Multilingual support
   - **GPT-OSS 120B** - Most capable model
4. Optionally add a GitHub repository URL (not yet implemented)
5. Click "Generate Architecture Review"
6. Wait 30-60 seconds for the AI analysis
7. View the comprehensive architecture review

## API Endpoints

### `POST /api/reviews`
Create a new architecture review.

**Request Body:**
```json
{
  "architectureText": "# My Architecture\n...",
  "repoUrl": "https://github.com/user/repo", // optional
  "model": "llama-3.3-70b-versatile" // optional (defaults to llama-3.3-70b-versatile)
}
```

**Response:** `ArchitectureReview` object (201 Created)

### `GET /api/reviews/:id`
Retrieve a stored review by ID.

**Response:** `ArchitectureReview` object (200 OK)

### `GET /api/reviews`
List all reviews (for debugging).

**Response:** Array of `ArchitectureReview` objects

### `GET /health`
Health check endpoint.

## Example Architecture Document

```markdown
# E-Commerce Platform Architecture

## Overview
A microservices-based e-commerce platform handling 10K requests/day.

## Components

### User Service
- Tech: Node.js + Express
- Database: PostgreSQL
- Handles user authentication and profiles

### Product Service
- Tech: Python + FastAPI
- Database: MongoDB
- Manages product catalog

### Order Service
- Tech: Node.js + Fastify
- Database: PostgreSQL
- Processes orders and payments via Stripe API

## Infrastructure
- Load Balancer: AWS ALB
- Cache: Redis
- Message Queue: RabbitMQ

## Deployment
Docker containers on AWS ECS
```

## Development

### Type Safety
All types are defined in `packages/shared/src/types.ts` and shared between frontend and backend.

### Adding New LLM Providers
Implement the `LLMClient` interface in `packages/backend/src/llm/client.ts`:

```typescript
export interface LLMClient {
  complete(messages: LLMMessage[], options?: CompletionOptions): Promise<string>;
}
```

### Storage Backend
Currently uses in-memory storage. To add a database:

1. Implement a new class following the `ReviewStorage` interface
2. Replace the storage instance in `packages/backend/src/index.ts`

## Future Enhancements

- [ ] GitHub repository analysis (clone, parse code, generate CodeProfile)
- [ ] Support for architecture diagrams (PlantUML, Mermaid rendering)
- [ ] Persistent storage (PostgreSQL, MongoDB)
- [ ] User authentication
- [ ] Review history and comparison
- [ ] Export reports as PDF
- [ ] Real-time progress updates via WebSocket
- [ ] CI/CD integration (GitHub Actions, GitLab CI)

## License

MIT
