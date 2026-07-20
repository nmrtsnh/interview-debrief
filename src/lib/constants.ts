import type { InterviewStage } from "@/types/debrief";

export const SAMPLE_CANDIDATE_NAME = "Priya";

export const SAMPLE_INPUT =
  "Just finished with Priya for the senior PM role. Strong on roadmap prioritization — she walked through killing two features with usage data. Weak on metrics — when I asked about success criteria she stayed vague. Good energy, asked smart questions about our enterprise motion. Didn't go deep on stakeholder conflict. I'd lean yes but want one more conversation on analytics.";

export const DEFAULT_RUBRIC = [
  "Product strategy & prioritization",
  "Metrics & analytical thinking",
  "Communication & clarity",
  "Stakeholder management",
  "Culture add & collaboration",
];

export const ROLE_OPTIONS = [
  "Senior Product Manager",
  "Software Engineer",
  "Account Executive",
  "Design Lead",
  "Engineering Manager",
] as const;

export const STAGE_OPTIONS: InterviewStage[] = [
  "Screen",
  "Technical",
  "Panel",
  "Final",
];

export const AGENT_DELAY_MS = 400;

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function defaultContext(
  roleTitle = ROLE_OPTIONS[0],
  candidateName = "",
): {
  candidateName: string;
  roleTitle: string;
  stage: InterviewStage;
  rubric: string[];
} {
  return {
    candidateName,
    roleTitle,
    stage: "Final",
    rubric: [...DEFAULT_RUBRIC],
  };
}
