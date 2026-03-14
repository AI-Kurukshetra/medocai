---
name: vercel-deployer
description: Configure and deploy a Next.js app to Vercel with correct environment variables and smoke tests.
---

# Skill: vercel-deployer

## Purpose
Prepare and deploy the Next.js app to Vercel with correct environment configuration.

## When To Use
- Before the first deployment
- When adding environment variables or preview setups

## Inputs
- Supabase project URL and anon/service keys
- Desired environments (preview, production)

## Outputs
- Deployment checklist
- Environment variable list
- Vercel project configuration notes

## Workflow
1. Confirm build command and output directory.
2. List required env vars and where they are used.
3. Configure preview vs production values.
4. Deploy and verify a smoke test flow.

## Guardrails
- Never expose service role keys in the client.
- Validate env vars are available at build/runtime as needed.
