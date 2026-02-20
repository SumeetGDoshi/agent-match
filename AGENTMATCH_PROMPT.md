# AgentMatch MVP — Build with Ralph Wiggum Loop

You are building AgentMatch, a B2C web app for AI agent capability exchange.

**Tech Stack (STRICT):**
- Frontend: Next.js (App Router) + Tailwind + shadcn/ui
- Backend: Node.js (Next.js API routes)
- DB: PostgreSQL + Prisma
- Auth: NextAuth
- Tests: Vitest + Playwright

**Core Mechanic:** Two agents match → exchange MCP tool manifests → both become more capable. NO hybrid spawning by default.

---

## Task List (Complete in Order)

Work through these tasks sequentially. Check off each when complete and tests pass.

- [ ] 1. Scaffold Next.js project + install dependencies
- [ ] 2. Set up PostgreSQL + Prisma schema (User, Agent, ToolManifest, MatchSession, CapabilityExchange)
- [ ] 3. Configure NextAuth (email + Google OAuth)
- [ ] 4. Create agent CRUD API routes + Zod validation
- [ ] 5. Build agent browse page with search/filter
- [ ] 6. Implement "First Date" sandbox test runner
- [ ] 7. Build compatibility scoring function + tests
- [ ] 8. Create capability exchange logic + audit logging
- [ ] 9. Build exchange confirmation UI
- [ ] 10. Add Playwright e2e tests for full flow
- [ ] 11. Write README with setup instructions

---

## Success Criteria (All Must Pass)

✓ All Vitest unit tests pass  
✓ All Playwright e2e tests pass  
✓ `npm run build` completes without errors  
✓ README includes setup steps + env vars  
✓ Capability exchange produces deterministic, audited results  

---

## Verification After Each Task

After completing each task:
1. Run `npm test` — all tests must pass
2. Run `npm run build` — must complete successfully
3. Commit changes with message: `feat: [task description]`
4. Only then proceed to next task

---

## If Stuck After 15 Iterations

If a task is not complete after 15 attempts:
1. Document what's blocking progress
2. List all approaches attempted
3. Check official docs for:
   - Next.js App Router patterns
   - Prisma schema best practices
   - NextAuth v5 configuration
4. Output `<promise>BLOCKED:[task number]</promise>` with explanation
5. Wait for human guidance

---

## Output Format

After **all tasks complete** and **all tests pass**:
```
<promise>COMPLETE</promise>
```

Do NOT output this until:
- All 11 tasks checked off
- All tests passing (unit + e2e)
- Build succeeds
- README written

---

## Start Now

Begin with Task 1. Work iteratively. Run tests frequently. Commit after each task completion.
