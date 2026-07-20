# InterviewDebrief

**Finish the debrief before you reach the next meeting.**

InterviewDebrief turns messy post-interview voice notes into a structured hiring decision pack — scorecard, quality flags, panel debrief, and draft messages. **Three specialised analysis stages** (Evidence → Rubric → Decision Pack) create the decision pack.

Built with [Cursor](https://cursor.com) and [Next.js](https://nextjs.org) as a hackathon prototype for interviewers who need to debrief quickly and responsibly.

## Product overview

InterviewDebrief helps hiring managers and interviewers convert spoken or typed post-interview notes into a review-ready pack. It separates **observed evidence** from **interviewer interpretation**, flags vague or unsupported feedback, and proposes a **draft next step** for human review — not an automated hire/no-hire decision.

## Target user

- Hiring managers and interview panelists after a live interview
- Recruiters supporting debrief coordination
- Teams exploring structured, evidence-backed interview feedback

## Problem

After an interview, debriefs often land in Slack or a blank doc. Feedback gets vague, rubric criteria are skipped, missing coverage is treated as weakness, and the panel debrief gets delayed.

## Workflow

1. Enter the **candidate name**, **role**, and **interview stage**
2. Speak or type a post-interview debrief
3. Three sequential analysis stages run:
   - **Evidence** — extract facts, strengths, concerns, and gaps
   - **Rubric** — score competencies with evidence and confidence; flag quality issues
   - **Decision Pack** — produce scorecard, summary, drafts, and a draft next step
4. Review, copy, or export for panel discussion

```
Debrief → Evidence → Rubric → Decision Pack → Review-ready pack
```

## Architecture

InterviewDebrief uses a three-stage analysis pipeline. The public prototype runs deterministic local analysis, while an optional Cursor SDK path is included for future live-agent experimentation.

Each stage receives the original debrief plus structured output from prior stages:

| Stage | Output |
|-------|--------|
| **Evidence** | Key moments, strengths, concerns, missing topics |
| **Rubric** | Competency ratings with evidence + confidence, quality flags |
| **Decision Pack** | Summary cards, scorecard, Slack draft, panel notes, candidate follow-up |

Implementation lives in:

- `src/lib/agents/fallback.ts` — deterministic local analysis (demo mode default)
- `src/lib/agents/orchestrator.ts` — routes stages; optional live `@cursor/sdk` path
- `src/lib/competencyScoring.ts` — evidence-backed competency scoring
- `src/lib/decisionSummary.ts` — decision summary and draft next step logic

The Cursor SDK is **never called from client-side code**. `CURSOR_API_KEY` is read only on the server inside the API route / orchestrator.

## Analysis modes

### Demo mode

- Uses deterministic local TypeScript logic
- Requires no API key
- Keeps the public prototype predictable
- Is the default mode used by the deployed application

Set in `.env.local`:

```bash
AGENT_MODE=demo
```

### Optional live mode

- Uses the existing `@cursor/sdk` integration
- Requires a server-side `CURSOR_API_KEY`
- Must never expose the API key to the browser
- May incur usage costs
- Is not enabled in the public demo

To enable locally:

1. Remove or comment out `AGENT_MODE=demo` in `.env.local`
2. Add `CURSOR_API_KEY=your_key` (server-side only)

## Technology used (exact)

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| Voice input | Web Speech API (browser) |
| Demo analysis | Local TypeScript functions (`AGENT_MODE=demo`) |
| Optional live analysis | `@cursor/sdk` `Agent.prompt()` on the server when demo mode is off |
| Export | Client-side Markdown download |

## Local setup

```bash
cd interview-debrief
npm install
npm run dev
```

Open http://localhost:3000

Copy `.env.example` to `.env.local` if you want the explicit demo config (`AGENT_MODE=demo` is the safe default).

### Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run test` | Unit tests |
| `npm run test:debrief` | Integration test (requires dev server) |

## Screenshots

_Add screenshots here before publishing — suggested captures:_

1. Input screen with candidate name, role, stage, and voice input
2. Processing stepper (Evidence → Rubric → Decision Pack)
3. Results summary with decision cards and draft next step
4. Scorecard tab with evidence and confidence columns
5. Flags tab with structured quality issues

## Human review

- All outputs are **drafts for human review only**
- The UI labels the outcome **Draft next step**, not a final hiring decision
- Candidate follow-up drafts include a **Review and approve before sending** notice
- Missing evidence is labelled **Not assessed**, not automatically treated as weakness

## Limitations

- **Prototype only** — not production hiring software
- **Does not make hiring decisions** — humans remain accountable
- **Output quality depends on input quality** — thin debriefs produce thin packs
- **Missing evidence ≠ negative evidence** — uncovered competencies stay Not assessed
- **No protected characteristics** — the system must not infer age, gender, race, religion, disability, or similar attributes; flags focus on feedback quality only
- **Public demo uses deterministic local logic** — not live Cursor SDK agents
- **PM-focused default rubric** — other roles work but may need rubric customization in future versions

## Responsible use

- Do not use outputs as automated hire/reject actions
- Review all flags, ratings, and drafts before sharing internally or with candidates
- Do not send candidate messages without human approval
- Avoid subjective labels without behavioural examples in your source notes

## Future improvements

- Role-specific rubrics (Engineering, Sales, Design)
- Richer NLP / live model analysis for free-form debriefs
- Panel aggregation across multiple interviewers
- ATS export formats

## API

`POST /api/debrief`

```json
{
  "transcript": "Post-interview debrief…",
  "step": "evidence" | "rubric" | "pack",
  "context": {
    "candidateName": "Priya",
    "roleTitle": "Senior Product Manager",
    "stage": "Final",
    "rubric": ["Product strategy & prioritization", "…"]
  },
  "prior": { "evidence": { … }, "rubric": { … } }
}
```

## Demo

See [DEMO.md](DEMO.md) for a 60–90 second recording script.

---

Built with [Cursor](https://cursor.com) and [Next.js](https://nextjs.org).
