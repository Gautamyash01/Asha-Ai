# Asha-Ai

## Overview

**Asha-Ai** is an AI-assisted rural health and triage dashboard. It helps ASHA workers and primary-care teams:

- **Triage patients** based on vitals and symptoms
- **Estimate disease likelihood** and deterioration risk
- **Monitor outbreaks** and village-level resource needs

The project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Getting started (local development)

```sh
git clone <YOUR_GIT_URL>
cd Asha-Ai
npm install
npm run dev
```

Frontend runs by default on `http://localhost:5173` (or whatever Vite prints in the terminal).

## Backend (rule-based triage API)

The Express backend (under `server/`) exposes a simple `/triage` endpoint used by the triage page.

```sh
cd server
npm install
node src/index.js
```

This will start the API on `http://localhost:5050`.
