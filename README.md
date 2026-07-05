# AutoWrite

## Overview
A modern Vite + Express project that generates UI components from Figma designs.

## Local Development
1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
2. Fill in your personal tokens (`GEMINI_API_KEY`, `FIGMA_TOKEN`, `VERCEL_TOKEN`).
3. Install dependencies and start the dev server:
   ```bash
   npm ci
   npm run dev
   ```

## CI/CD (GitHub Actions)
- Runs on every push to `master`.
- Steps: lint, test, build, and deploy to Vercel.
- Ensure `VERCEL_TOKEN` is stored as a **GitHub secret**.

## Adding Secrets
- In Vercel: add `GEMINI_API_KEY` and `FIGMA_TOKEN` as environment variables.
- In GitHub: add `VERCEL_TOKEN` under Settings → Secrets → Actions.

## License
MIT
