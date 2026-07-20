# Demo script (60–90 seconds)

## Setup

1. Run `npm install && npm run dev`
2. Open http://localhost:3000

No API key needed — the app runs in demo mode by default.

## Script

**Opening (15s)**  
"After an interview, hiring managers still manually write scorecards, panel debriefs, and Slack updates. InterviewDebrief turns one messy voice note into all of that — using three separate agents in sequence, not one chatbot."

**Live demo (60s)**  
1. Set role to **Senior Product Manager**, stage to **Final**
2. Click **Use sample input** (or speak a post-interview debrief)
3. Click **Generate Debrief**
4. Point at the stepper: "Agent 1 extracts evidence. Agent 2 scores the rubric and flags vague feedback. Agent 3 produces the decision pack."
5. Scroll to results: Scorecard → Rubric flags → Panel debrief → Slack message
6. Highlight the **Draft: Hold** badge and rubric warning on metrics
7. Click **Copy Slack** to show it's ready to paste

**Technical callout (15s)**  
"Each step is a separate agent call in `src/lib/agents/orchestrator.ts`. The Rubric agent only sees the Evidence JSON plus the original debrief. That's intentional multi-agent orchestration — the same pattern you'd wire to live models in production."

**Close (10s)**  
"Messy interview ramble in, finished hiring pack out. Built with Cursor and Next.js."

## Sample live voice script

> "Just finished with Priya for the senior PM role. Strong on roadmap prioritization — she walked through killing two features with usage data. Weak on metrics — when I asked about success criteria she stayed vague. Good energy, asked smart questions about our enterprise motion. Didn't go deep on stakeholder conflict. I'd lean yes but want one more conversation on analytics."

## Tips

- Use the **Priya sample** for the strongest demo output in demo mode.
- Demo mode uses local logic in `src/lib/agents/fallback.ts` — instant, free, works offline.
