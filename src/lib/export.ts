import type { DebriefResult, InterviewStage } from "@/types/debrief";
import { HUMAN_REVIEW_NOTICE } from "@/lib/recommendations";

export function buildMarkdownExport(
  transcript: string,
  result: DebriefResult,
  roleTitle: string,
  stage: InterviewStage,
): string {
  const { evidence, rubric, pack } = result;
  const summary = pack.decisionSummary;

  const competencyRows = pack.scorecardSummary.competencyTable
    .map(
      (c) =>
        `| ${c.competency} | ${c.score} | ${c.evidence.replace(/\|/g, "\\|")} | ${c.confidence} |`,
    )
    .join("\n");

  const flags = rubric.biasAndQualityFlags.length
    ? rubric.biasAndQualityFlags
        .map(
          (f) =>
            `### ${f.issue}\n\n- **Why it matters:** ${f.whyItMatters}\n- **Recommended correction:** ${f.recommendedCorrection}`,
        )
        .join("\n\n")
    : "_None flagged_";

  const followUps = rubric.recommendedFollowUpsBeforeDecision.length
    ? rubric.recommendedFollowUpsBeforeDecision.map((f) => `- ${f}`).join("\n")
    : "_None suggested_";

  return `# Interview Debrief — ${evidence.candidateName}

> **Draft next step:** ${pack.recommendation}

${HUMAN_REVIEW_NOTICE}

**Role:** ${roleTitle}  
**Stage:** ${stage}  
**Assessment confidence:** ${rubric.confidenceInAssessment}

## Decision summary

| | |
|---|---|
| **Strongest signal** | ${summary.strongestSignal} |
| **Main concern** | ${summary.mainConcern} |
| **Not assessed** | ${summary.notAssessed} |
| **Suggested next step** | ${summary.suggestedNextStep} |

## Original debrief

${transcript}

## Interviewer interpretation

${pack.recommendationRationale}

### Observed evidence

${evidence.demonstratedStrengths.map((s) => `- ${s}`).join("\n") || "_None captured_"}

### Missing evidence

${evidence.missingTopicsNotCovered.map((m) => `- ${m}`).join("\n") || "_None noted_"}

### Key moments

${
  evidence.keyMoments
    .map((m) => {
      const quote = m.candidateQuoteOrParaphrase
        ? `\n  - Quote/paraphrase: ${m.candidateQuoteOrParaphrase}`
        : "";
      return `- **${m.topic}:** ${m.whatHappened}${quote}\n  - Observation: ${m.interviewerObservation}`;
    })
    .join("\n") || "_None captured_"
}

## Competency scorecard

| Competency | Rating | Evidence | Confidence |
|------------|--------|----------|------------|
${competencyRows}

## Quality flags

${flags}

## Suggested follow-ups

${followUps}

## Panel debrief

${pack.panelDebriefNotes}

## Slack draft

${pack.slackMessageDraft}

${pack.candidateFollowUpDraft ? `## Candidate follow-up draft\n\n${pack.candidateFollowUpDraft}` : ""}

## Next steps for the hiring team

${pack.nextStepChecklist.map((s) => `- [ ] ${s}`).join("\n")}

---

_${HUMAN_REVIEW_NOTICE}_
`;
}
