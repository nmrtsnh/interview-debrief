# InterviewDebrief

**Finish the debrief before you reach the next meeting.**

InterviewDebrief turns messy post-interview voice notes into a hiring decision pack — using a **three-agent workflow** (Evidence → Rubric → Decision Pack), not a single chatbot.

Built for the bliq × Cursor hackathon brief: voice in, finished work out, with meaningful multi-agent orchestration.

## Problem

After an interview, hiring managers dump impressions into Slack or a blank doc. Feedback gets vague, rubric criteria get skipped, and the panel debrief gets delayed.

## Solution

Speak or type a post-interview debrief. Three agents run sequentially:

```
Debrief → Evidence Agent → Rubric Agent → Decision Pack Agent → Hiring pack
```

| Agent | Output |
|-------|--------|
| **Evidence** | Facts, key moments, strengths, concerns, gaps |
| **Rubric** | Competency scores, bias/quality flags, follow-ups |
| **Decision Pack** | Scorecard, panel debrief, Slack draft, draft recommendation |

Each agent receives the prior agent's structured JSON plus the original debrief — intentional multi-agent orchestration.

## Demo mode (default)

This project runs in **demo mode** with local deterministic agents — **no API key, no cost**.

```bash
cd interview-debrief
npm install
npm run dev
```

Open http://localhost:3000

Copy `.env.example` to `.env.local` if you want the explicit demo config (`AGENT_MODE=demo`).

### Optional: live Cursor SDK agents

To switch to live `Agent.prompt` calls via the [Cursor SDK](https://cursor.com/docs/sdk/typescript):

1. Remove or comment out `AGENT_MODE=demo` in `.env.local`
2. Add `CURSOR_API_KEY=your_key`

## Tech stack

- Next.js 16 (App Router)
- TypeScript + Tailwind CSS
- Local agent pipeline (demo mode) with optional `@cursor/sdk` integration
- Web Speech API for voice input

## API

`POST /api/debrief`

```json
{
  "transcript": "Post-interview debrief…",
  "step": "evidence" | "rubric" | "pack",
  "context": {
    "roleTitle": "Senior Product Manager",
    "stage": "Final",
    "rubric": ["Product strategy & prioritization", "…"]
  },
  "prior": { "evidence": { … }, "rubric": { … } }
}
```

## Demo

See [DEMO.md](DEMO.md) for a 60–90 second recording script.

## Disclaimer

Recommendations are **drafts for human review only**. InterviewDebrief is an admin automation prototype — not a hiring decision system.

---

Built with [Cursor](https://cursor.com) and [Next.js](https://nextjs.org).
