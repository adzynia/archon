# Troubleshooting Guide

## Common Issues and Solutions

### 1. Backend Won't Start

#### Error: "GROQ_API_KEY environment variable is required"
**Cause:** Missing or invalid Groq API key

**Solution:**
```bash
cd packages/backend
# Check if .env file exists
ls -la .env

# Verify the content
cat .env

# Should contain:
# GROQ_API_KEY=gsk_...
# PORT=3001
```

If missing, copy from example:
```bash
cp .env.example .env
# Edit .env and add your Groq API key
```

#### Error: "Port 3001 already in use"
**Cause:** Another process is using port 3001

**Solution:**
```bash
# Find what's using the port
lsof -i :3001

# Kill the process (replace PID with actual number)
kill -9 <PID>

# Or change the port in packages/backend/.env
PORT=3002
```

#### Error: "Cannot find module '@archon/shared'"
**Cause:** Shared package not built

**Solution:**
```bash
cd packages/shared
pnpm build

# Or from root
cd /Users/andrii/code/archon
pnpm --filter @archon/shared build
```

### 2. Frontend Won't Start

#### Error: "Module not found: Can't resolve '@archon/shared'"
**Cause:** Shared types not built or not properly linked

**Solution:**
```bash
# Build shared package
cd packages/shared
pnpm build

# Clear Next.js cache
cd ../frontend
rm -rf .next
pnpm dev
```

#### Frontend shows blank page
**Cause:** Backend not running or wrong API URL

**Solution:**
```bash
# Check backend is running
curl http://localhost:3001/health

# Should return: {"status":"ok"}

# Verify frontend .env.local
cat packages/frontend/.env.local

# Should contain:
# NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. CORS Errors

#### Error: "Access-Control-Allow-Origin" in browser console
**Cause:** Frontend URL not allowed by backend CORS

**Solution:**
Edit `packages/backend/src/index.ts`:
```typescript
fastify.register(cors, {
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  // Or allow all for development:
  // origin: true,
});
```

### 4. LLM / Groq API Errors

#### Error: "Failed to generate architecture review"
**Cause:** Multiple possible causes

**Debug steps:**
1. Check backend logs in terminal for detailed error
2. Verify Groq API key is valid:
   ```bash
   curl https://api.groq.com/openai/v1/models \
     -H "Authorization: Bearer gsk_YOUR_KEY_HERE"
   ```

3. Check Groq API status: https://status.groq.com

#### Error: "Rate limit exceeded"
**Cause:** Too many requests to Groq API

**Solution:**
- Wait a few minutes before retrying
- Check your Groq dashboard for rate limits
- Consider upgrading your Groq plan

#### Error: "Model not found"
**Cause:** Invalid model name

**Solution:**
Edit `packages/backend/src/index.ts`:
```typescript
// Change model name
const llmClient = new GroqLLMClient(
  GROQ_API_KEY,
  'llama-3.1-70b-versatile'  // or another valid model
);
```

Valid Groq models:
- `llama-3.1-70b-versatile`
- `llama-3.1-8b-instant`
- `mixtral-8x7b-32768`
- `gemma2-9b-it`

### 5. JSON Parsing Errors

#### Error: "Failed to parse ArchitectureModel from LLM response"
**Cause:** LLM returned invalid JSON or unexpected format

**Debug:**
1. Check backend logs for the raw LLM response
2. The LLM might be returning markdown-wrapped JSON

**Solution:**
Edit `packages/backend/src/services/review.ts` and add better JSON extraction:
```typescript
// Clean response before parsing
let cleanResponse = response.trim();

// Remove markdown code fences if present
if (cleanResponse.startsWith('```')) {
  cleanResponse = cleanResponse.replace(/^```json?\n?/, '').replace(/\n?```$/, '');
}

const model = JSON.parse(cleanResponse);
```

### 6. Installation Issues

#### Error: "pnpm: command not found"
**Solution:**
```bash
npm install -g pnpm
```

#### Error: "Permission denied" when installing pnpm
**Solution:**
```bash
# Use sudo (macOS/Linux)
sudo npm install -g pnpm

# Or install without sudo using nvm
# First install nvm, then:
nvm install 20
npm install -g pnpm
```

#### Error: "EACCES" or permission errors during pnpm install
**Solution:**
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules

# Then retry
pnpm install
```

### 7. TypeScript Errors

#### Error: "Cannot find type definitions"
**Solution:**
```bash
# Clean and rebuild
rm -rf node_modules packages/*/node_modules
rm -rf packages/*/dist
rm pnpm-lock.yaml

# Reinstall
pnpm install
pnpm --filter @archon/shared build
```

#### Error: "Type error in Next.js build"
**Solution:**
```bash
cd packages/frontend
rm -rf .next
rm -rf node_modules/.cache
pnpm build
```

### 8. Performance Issues

#### Review takes too long (>2 minutes)
**Possible causes:**
1. Groq API latency (should be fast)
2. Document is very large
3. Network issues

**Solutions:**
- Try a faster model: `llama-3.1-8b-instant`
- Reduce `maxTokens` in `packages/backend/src/services/review.ts`
- Check network connectivity to Groq API

#### High memory usage
**Cause:** Large in-memory storage or Next.js dev mode

**Solutions:**
- Clear old reviews: Restart backend server
- Use production mode: `pnpm build && pnpm start`

### 9. Development Issues

#### Hot reload not working
**Backend:**
```bash
# tsx watch should auto-reload
# If not, restart manually
cd packages/backend
pnpm dev
```

**Frontend:**
```bash
# Next.js Fast Refresh should work
# If not, delete .next and restart
cd packages/frontend
rm -rf .next
pnpm dev
```

#### Changes to shared types not reflecting
**Solution:**
```bash
# Rebuild shared package
cd packages/shared
pnpm build

# Restart both backend and frontend
```

### 10. Production Build Issues

#### Backend build fails
**Solution:**
```bash
cd packages/backend
rm -rf dist
pnpm build

# Check for TypeScript errors
npx tsc --noEmit
```

#### Frontend build fails
**Solution:**
```bash
cd packages/frontend
rm -rf .next
pnpm build

# If still fails, check for:
# 1. Unused imports
# 2. Type errors
# 3. Missing dependencies
```

## Getting Help

### Check Logs

**Backend logs:**
- Terminal where you ran `pnpm dev` from backend
- Look for detailed error messages and stack traces

**Frontend logs:**
- Terminal where you ran `pnpm dev` from frontend
- Browser DevTools console (F12)
- Network tab for failed API requests

### Enable Debug Mode

**Backend - Verbose Groq logs:**
Edit `packages/backend/src/llm/client.ts`:
```typescript
async complete(messages: LLMMessage[], options = {}) {
  console.log('LLM Request:', JSON.stringify(messages, null, 2));

  const response = await this.client.chat.completions.create({...});

  console.log('LLM Response:', response);

  return response.choices[0]?.message?.content || '';
}
```

**Frontend - Log API calls:**
Edit `packages/frontend/src/app/page.tsx`:
```typescript
const handleSubmit = async (e) => {
  console.log('Submitting request:', request);

  const response = await fetch(...);
  console.log('API response:', response);

  const reviewData = await response.json();
  console.log('Review data:', reviewData);
};
```

### Verify System Health

```bash
# From project root
cd /Users/andrii/code/archon

# Check all packages are installed
pnpm list --depth 0

# Check shared types are built
ls -la packages/shared/dist

# Health check backend (if running)
curl http://localhost:3001/health

# Test Groq API directly
curl https://api.groq.com/openai/v1/chat/completions \
  -H "Authorization: Bearer $(cat packages/backend/.env | grep GROQ_API_KEY | cut -d= -f2)" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama-3.1-8b-instant",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

## Still Having Issues?

1. **Check the README.md** for setup instructions
2. **Read QUICKSTART.md** for step-by-step guide
3. **Review PROJECT_STRUCTURE.md** to understand the architecture
4. **Check Groq documentation**: https://console.groq.com/docs
5. **Check Next.js documentation**: https://nextjs.org/docs
6. **Check Fastify documentation**: https://fastify.dev/docs

## Reset Everything

If all else fails, start fresh:

```bash
cd /Users/andrii/code/archon

# Clean everything
rm -rf node_modules packages/*/node_modules
rm -rf packages/*/dist packages/*/.next
rm pnpm-lock.yaml

# Reinstall
pnpm install

# Rebuild shared
cd packages/shared
pnpm build

# Start fresh
cd ../..
pnpm dev
```
