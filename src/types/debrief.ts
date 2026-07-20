export type AgentStatus = "waiting" | "working" | "complete" | "error";

export type AgentStep = "evidence" | "rubric" | "pack";

export type InterviewStage = "Screen" | "Technical" | "Panel" | "Final";

export type CompetencyRating = "Strong" | "Mixed" | "Weak" | "Not assessed";

export type EvidenceQuality = "Specific" | "Partial" | "Vague" | "None";

export type FlagSeverity = "Info" | "Warning";

export type Recommendation =
  | "Proceed to next stage"
  | "Focused follow-up required"
  | "Panel review required"
  | "Insufficient evidence";

export type ConfidenceLevel = "High" | "Medium" | "Low";

export interface DebriefContext {
  candidateName: string;
  roleTitle: string;
  stage: InterviewStage;
  rubric: string[];
}

export interface KeyMoment {
  topic: string;
  whatHappened: string;
  candidateQuoteOrParaphrase: string | null;
  interviewerObservation: string;
}

export interface EvidenceOutput {
  candidateName: string;
  roleDiscussed: string | null;
  interviewFormat: string;
  keyMoments: KeyMoment[];
  demonstratedStrengths: string[];
  demonstratedConcerns: string[];
  skillsMentioned: string[];
  openQuestions: string[];
  missingTopicsNotCovered: string[];
  overallImpressionRaw: string;
}

export interface CompetencyScoreEntry {
  competency: string;
  score: CompetencyRating;
  evidence: string;
  confidence: ConfidenceLevel;
  evidenceQuality: EvidenceQuality;
}

export interface QualityFlag {
  issue: string;
  whyItMatters: string;
  recommendedCorrection: string;
  severity: FlagSeverity;
}

export interface RubricOutput {
  competencyScores: CompetencyScoreEntry[];
  biasAndQualityFlags: QualityFlag[];
  criticalGaps: string[];
  recommendedFollowUpsBeforeDecision: string[];
  confidenceInAssessment: ConfidenceLevel;
}

export interface CompetencyTableRow {
  competency: string;
  score: CompetencyRating;
  evidence: string;
  confidence: ConfidenceLevel;
}

export interface DecisionSummary {
  strongestSignal: string;
  mainConcern: string;
  notAssessed: string;
  suggestedNextStep: string;
}

export interface ScorecardSummary {
  headline: string;
  topStrengths: string[];
  topRisks: string[];
  competencyTable: CompetencyTableRow[];
}

export interface DecisionPackOutput {
  recommendation: Recommendation;
  recommendationRationale: string;
  decisionSummary: DecisionSummary;
  scorecardSummary: ScorecardSummary;
  panelDebriefNotes: string;
  slackMessageDraft: string;
  candidateFollowUpDraft: string | null;
  nextStepChecklist: string[];
}

export interface DebriefResult {
  evidence: EvidenceOutput;
  rubric: RubricOutput;
  pack: DecisionPackOutput;
}

export interface DebriefStepResponse {
  step: AgentStep;
  data: EvidenceOutput | RubricOutput | DecisionPackOutput;
  source: "cursor-sdk" | "fallback";
}
