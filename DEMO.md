# Demo script (60–90 seconds)

## Setup

1. Run `npm install && npm run dev`
2. Open http://localhost:3000

No API key needed — the app runs in demo mode by default.

## Script

**Opening (15s)**  
"After an interview, hiring managers still manually write scorecards, panel debriefs, and Slack updates. InterviewDebrief turns one messy voice note into all of that — using three specialised analysis stages, not one chatbot."

**Live demo (60s)**  
1. Enter candidate name **Alex**, role **Senior Product Manager**, stage **Final**
2. Click **Try sample** (or speak a post-interview debrief)
3. Click **Generate debrief**
4. Point at the stepper: "Evidence extracts facts. Rubric scores competencies and flags vague feedback. Decision Pack produces the review-ready pack."
5. Highlight the summary cards and **Draft next step: Focused follow-up required**
6. Scroll through Scorecard → Flags → Messages
7. Click **Copy Slack** or **Export markdown**

**Technical callout (15s)**  
"Each stage runs sequentially in `src/lib/agents/orchestrator.ts`. The public demo uses deterministic local TypeScript analysis. An optional Cursor SDK path exists for live-agent experimentation, but it is not enabled in this demo."

**Close (10s)**  
"Messy interview ramble in, review-ready hiring pack out. Built with Cursor and Next.js — for human review, not automated hiring decisions."

## Tips

- Use the **Alex sample** for the strongest demo output in demo mode.
- Emphasize that outputs are **draft next steps**, not final decisions.
- Say **Built with Cursor**, not "Built with Cursor SDK" — the SDK is optional and off by default.
