import type { Recommendation } from "@/types/debrief";

export const HUMAN_REVIEW_NOTICE =
  "For human review only. This prototype does not make automated hiring decisions.";

export const RECOMMENDATION_LABELS: Record<Recommendation, string> = {
  "Proceed to next stage": "Proceed to next stage",
  "Focused follow-up required": "Focused follow-up required",
  "Panel review required": "Panel review required",
  "Insufficient evidence": "Insufficient evidence",
};

export const recommendationStyles: Record<
  Recommendation,
  { pill: string; card: string }
> = {
  "Proceed to next stage": {
    pill: "bg-emerald-100 text-emerald-800 ring-emerald-200/80",
    card: "bg-emerald-50/50 ring-emerald-100",
  },
  "Focused follow-up required": {
    pill: "bg-amber-100 text-amber-900 ring-amber-200/80",
    card: "bg-amber-50/60 ring-amber-100",
  },
  "Panel review required": {
    pill: "bg-sky-100 text-sky-900 ring-sky-200/80",
    card: "bg-sky-50/50 ring-sky-100",
  },
  "Insufficient evidence": {
    pill: "bg-stone-200 text-stone-700 ring-stone-300/80",
    card: "bg-stone-50/80 ring-stone-200",
  },
};

/** Map legacy SDK output values to the safer public labels. */
export function normalizeRecommendation(value: string): Recommendation {
  const normalized = value.trim().toLowerCase();
  if (normalized === "advance" || normalized === "proceed to next stage") {
    return "Proceed to next stage";
  }
  if (normalized === "hold" || normalized === "focused follow-up required") {
    return "Focused follow-up required";
  }
  if (normalized === "panel review required") {
    return "Panel review required";
  }
  if (normalized === "reject" || normalized === "insufficient evidence") {
    return "Insufficient evidence";
  }
  return "Panel review required";
}

export function recommendationForSlack(recommendation: Recommendation): string {
  return recommendation;
}
