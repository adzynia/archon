# Quick Start Guide

## Installation Complete!

Your Archon project is ready to run. Here's how to start it:

## Start the Application

### Option 1: Start Everything at Once (Recommended)

Open a terminal and run:
```bash
pnpm dev
```

This will start both the backend (port 3001) and frontend (port 3000) in parallel.

### Option 2: Start Separately

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

## Access the Application

- **Frontend UI**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## Test It Out

1. Open http://localhost:3000 in your browser
2. Paste this example architecture document:

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

3. Click "Generate Review"
4. Wait 30-60 seconds for Groq to analyze the architecture
5. Review the detailed architecture analysis!

## What's Happening Behind the Scenes?

When you submit a document, Archon:

1. **Parses** the document (extracts sections and diagrams)
2. **Calls Groq LLM** (using Llama 3.1 70B) in 3 stages:
   - Extract structured architecture model
   - Detect issues (scalability, security, reliability, etc.)
   - Generate comprehensive Markdown report
3. **Stores** the review in memory
4. **Displays** the results with issues categorized by severity

## Configuration

Your Groq API key is already configured in:
- `packages/backend/.env`

To change settings:
- Backend port: Edit `PORT` in `packages/backend/.env`
- LLM model: Edit `packages/backend/src/index.ts` (default: `llama-3.1-70b-versatile`)

## Troubleshooting

**Backend won't start:**
- Check that port 3001 is not in use
- Verify your Groq API key in `packages/backend/.env`

**Frontend won't connect:**
- Make sure backend is running on port 3001
- Check `NEXT_PUBLIC_API_URL` in `packages/frontend/.env.local`

**LLM errors:**
- Verify Groq API key is valid
- Check Groq rate limits at https://console.groq.com

## Next Steps

- Add more complex architecture documents
- Explore the API endpoints directly (see README.md)
- Customize LLM prompts in `packages/backend/src/llm/prompts.ts`
- Implement GitHub repo analysis (currently stubbed)

Enjoy using Archon!
