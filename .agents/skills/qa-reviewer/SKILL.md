---
name: qa-reviewer
description: Validate critical paths, find regressions, and document missing edge cases before demo or deployment.
---

# Skill: qa-reviewer

## Purpose
Validate critical paths, identify regressions, and surface missing edge cases.

## When To Use
- After key features are implemented
- Before demo or deployment

## Inputs
- User stories and acceptance criteria
- Current build or deployed preview

## Outputs
- Test checklist and results
- Bugs and severity notes
- Gaps in acceptance criteria or UX

## Workflow
1. Derive a concise test checklist from acceptance criteria.
2. Test critical flows first, then edge cases.
3. Record issues with steps to reproduce.
4. Highlight missing states (loading, error, empty).

## Guardrails
- Focus on user-visible regressions.
- Keep the checklist small and high impact.
