import type { DebriefResult } from "@/types/debrief";

export function buildMarkdownExport(
  transcript: string,
  result: DebriefResult,
  roleTitle: string,
): string {
  const { evidence, rubric, pack } = result;
  const competencyRows = pack.scorecardSummary.competencyTable
    .map((c) => `| ${c.competency} | ${c.score} | ${c.note} |`)
    .join("\n");

  const flags = rubric.biasAndQualityFlags.length
    ? rubric.biasAndQualityFlags.map((f) => `- **[${f.severity}]** ${f.flag} — ${f.suggestion}`).join("\n")
    : "_None flagged_";

  return `# Interview Debrief — ${evidence.candidateName ?? "Candidate"}

> Draft recommendation: **${pack.recommendation}** — hiring decision remains with your team.

**Role:** ${roleTitle}  
**Stage:** ${evidence.interviewFormat}

## Original debrief

${transcript}

## Evidence summary

${evidence.overallImpressionRaw}

### Key moments

${evidence.keyMoments.map((m) => `- **${m.topic}:** ${m.whatHappened}`).join("\n") || "_None captured_"}

## Rubric scores

| Competency | Score | Note |
|------------|-------|------|
${competencyRows}

### Quality flags

${flags}

**Confidence:** ${rubric.confidenceInAssessment}

## Decision pack

**Recommendation:** ${pack.recommendation}

${pack.recommendationRationale}

### Panel debrief notes

${pack.panelDebriefNotes}

### Slack draft

${pack.slackMessageDraft}

${pack.candidateFollowUpDraft ? `### Candidate follow-up draft\n\n${pack.candidateFollowUpDraft}` : ""}

### Next steps

${pack.nextStepChecklist.map((s) => `- [ ] ${s}`).join("\n")}
`;
}
