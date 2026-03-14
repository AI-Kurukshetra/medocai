# Project Agents Guide

This project uses multiple agents/subagents with clear responsibilities. Keep tasks small and hand off work to the most appropriate agent. Avoid overlapping ownership to reduce conflicts.

## Recommended Agents
- **Product Planner**: Convert SRS into epics, user stories, acceptance criteria, and milestones.
- **CDI Domain Expert**: Explain clinical documentation, coding, and CDI workflows; translate domain concepts into product requirements and data fields.
- **UI/UX Designer**: Define IA, user flows, wireframes, visual direction, and component inventory.
- **Next.js Engineer**: Implement frontend and server components, routing, and API routes.
- **Supabase Engineer**: Design schema, RLS policies, auth, and database migrations.
- **Vercel Deployer**: Configure deployment, environment variables, and preview/production setup.
- **QA Reviewer**: Create test plans, verify flows, identify regressions and missing edge cases.

## Collaboration Workflow
1. **Domain Grounding**: CDI Domain Expert explains domain terms, workflows, and data requirements.
2. **Planning**: Product Planner produces scoped MVP plan and acceptance criteria.
3. **Design**: UI/UX Designer produces user flows, page list, and component map.
4. **Data Model**: Supabase Engineer defines schema + RLS policy plan.
5. **Implementation**: Next.js Engineer builds UI + API routes with Supabase integration.
6. **Deployment**: Vercel Deployer configures environment and deploys.
7. **Validation**: QA Reviewer validates critical paths and documents gaps.

## Handoff Rules
- Each agent owns its output files or sections.
- Summarize assumptions and dependencies at the end of each handoff.
- Call out any missing info or risks immediately.

## Skill References
See `.agents/skills/*/SKILL.md` for standard workflows and checklists per role.
