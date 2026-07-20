import { buildMarkdownExport } from "@/lib/export";
import { stripMarkdown } from "@/lib/formatNotes";
import type { DebriefResult } from "@/types/debrief";

interface CopyButtonProps {
  label: string;
  copyKey: string;
  text: string;
  copiedKey: string | null;
  onCopy: (key: string, text: string) => void;
  variant?: "primary" | "secondary";
  className?: string;
}

export function CopyButton({
  label,
  copyKey,
  text,
  copiedKey,
  onCopy,
  variant = "secondary",
  className = "",
}: CopyButtonProps) {
  const isCopied = copiedKey === copyKey;
  const base =
    "inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent/40";
  const styles = isCopied
    ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200"
    : variant === "primary"
      ? "bg-accent text-white shadow-sm hover:bg-accent-hover"
      : "bg-surface text-stone-700 shadow-card ring-1 ring-stone-200/80 hover:shadow-card-hover";

  return (
    <button
      type="button"
      className={`${base} ${styles} ${className}`}
      onClick={() => onCopy(copyKey, text)}
      aria-label={isCopied ? `${label} copied` : label}
    >
      {isCopied ? (
        <>
          <CheckIcon />
          Copied
        </>
      ) : (
        label
      )}
    </button>
  );
}

function CheckIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M16.704 5.29a1 1 0 0 1 0 1.42l-7.25 7.25a1 1 0 0 1-1.42 0l-3.25-3.25a1 1 0 1 1 1.42-1.42l2.54 2.54 6.54-6.54a1 1 0 0 1 1.42 0Z" clipRule="evenodd" />
    </svg>
  );
}

export function formatScorecardText(result: DebriefResult): string {
  const { pack } = result;
  const rows = pack.scorecardSummary.competencyTable
    .map((c) => `${c.competency}: ${c.score} — ${c.note}`)
    .join("\n");

  return [
    pack.scorecardSummary.headline,
    "",
    "Top strengths:",
    ...pack.scorecardSummary.topStrengths.map((s) => `- ${s}`),
    "",
    "Top risks:",
    ...pack.scorecardSummary.topRisks.map((r) => `- ${r}`),
    "",
    "Competency scores:",
    rows,
    "",
    `Draft recommendation: ${pack.recommendation}`,
    pack.recommendationRationale,
  ].join("\n");
}

export function formatSlackText(result: DebriefResult): string {
  return result.pack.slackMessageDraft;
}

export function formatPanelDebriefText(result: DebriefResult): string {
  return stripMarkdown(result.pack.panelDebriefNotes);
}

export function formatFullDebriefText(
  transcript: string,
  result: DebriefResult,
  roleTitle: string,
): string {
  return buildMarkdownExport(transcript, result, roleTitle);
}

export function downloadMarkdown(
  transcript: string,
  result: DebriefResult,
  roleTitle: string,
) {
  const content = buildMarkdownExport(transcript, result, roleTitle);
  const name = result.evidence.candidateName?.toLowerCase().replace(/\s+/g, "-") ?? "candidate";
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `interview-debrief-${name}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
