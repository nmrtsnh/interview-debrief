"use client";

import { useState } from "react";
import { FormattedNotes, MessageBlock } from "@/components/FormattedNotes";
import {
  CopyButton,
  formatPanelDebriefText,
  formatScorecardText,
  formatSlackText,
  downloadMarkdown,
  formatFullDebriefText,
} from "@/components/CopyButton";
import type { DebriefResult, Recommendation } from "@/types/debrief";

interface DebriefResultsProps {
  result: DebriefResult;
  roleTitle: string;
  stage: string;
  transcript: string;
  copiedKey: string | null;
  onCopy: (key: string, text: string) => void;
  onStartAgain: () => void;
}

type TabId = "summary" | "scorecard" | "flags" | "messages";

const recommendationStyles: Record<
  Recommendation,
  { pill: string; card: string }
> = {
  Advance: {
    pill: "bg-emerald-100 text-emerald-800 ring-emerald-200/80",
    card: "bg-emerald-50/50 ring-emerald-100",
  },
  Hold: {
    pill: "bg-amber-100 text-amber-900 ring-amber-200/80",
    card: "bg-amber-50/60 ring-amber-100",
  },
  Reject: {
    pill: "bg-rose-100 text-rose-800 ring-rose-200/80",
    card: "bg-rose-50/50 ring-rose-100",
  },
};

const TABS: { id: TabId; label: string }[] = [
  { id: "summary", label: "Summary" },
  { id: "scorecard", label: "Scorecard" },
  { id: "flags", label: "Flags" },
  { id: "messages", label: "Messages" },
];

export function DebriefResults({
  result,
  roleTitle,
  stage,
  transcript,
  copiedKey,
  onCopy,
  onStartAgain,
}: DebriefResultsProps) {
  const [tab, setTab] = useState<TabId>("summary");
  const { evidence, rubric, pack } = result;
  const recStyle = recommendationStyles[pack.recommendation];
  const candidate = evidence.candidateName ?? "Candidate";

  return (
    <section aria-labelledby="results-heading" className="motion-safe:animate-fade-in-up space-y-5">
      <div className="text-center">
        <h2 id="results-heading" className="text-xl font-semibold text-stone-900">
          {candidate}
        </h2>
        <p className="mt-1 text-sm text-stone-500">
          {roleTitle} · {stage} interview
        </p>
      </div>

      <div className={`shadow-card rounded-2xl p-6 ring-1 ${recStyle.card}`}>
        <p className="text-xs font-medium uppercase tracking-wider text-stone-500">
          Draft recommendation
        </p>
        <span
          className={`mt-3 inline-block rounded-full px-4 py-1.5 text-sm font-semibold ring-1 ${recStyle.pill}`}
        >
          {pack.recommendation}
        </span>
        <p className="mt-4 text-[15px] leading-relaxed text-stone-600">
          {pack.recommendationRationale}
        </p>
        <p className="mt-4 border-t border-stone-200/60 pt-4 text-xs text-stone-400">
          For human review — not an automated hiring decision
        </p>
      </div>

      <div className="flex gap-1 rounded-xl bg-stone-200/50 p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
              tab === t.id
                ? "bg-surface text-stone-800 shadow-sm"
                : "text-stone-500 hover:text-stone-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="shadow-card rounded-2xl bg-surface p-6">
        {tab === "summary" && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <SummaryList title="Strengths" items={pack.scorecardSummary.topStrengths} />
              <SummaryList title="Risks" items={pack.scorecardSummary.topRisks} />
            </div>
            {pack.nextStepChecklist.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  Next steps
                </p>
                <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-stone-600">
                  {pack.nextStepChecklist.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}

        {tab === "scorecard" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <CopyButton
                label="Copy scorecard"
                copyKey="scorecard"
                text={formatScorecardText(result)}
                copiedKey={copiedKey}
                onCopy={onCopy}
              />
            </div>
            <div className="overflow-x-auto rounded-xl ring-1 ring-stone-100">
              <table className="w-full min-w-[400px] text-left text-sm">
                <thead className="bg-stone-50/80">
                  <tr className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                    <th className="px-4 py-3">Competency</th>
                    <th className="px-4 py-3">Score</th>
                    <th className="px-4 py-3">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {pack.scorecardSummary.competencyTable.map((row) => (
                    <tr key={row.competency} className="border-t border-stone-100">
                      <td className="px-4 py-3 font-medium text-stone-800">{row.competency}</td>
                      <td className="px-4 py-3">
                        <ScoreBadge score={row.score} />
                      </td>
                      <td className="px-4 py-3 text-stone-600">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "flags" && (
          <div className="space-y-4">
            <p className="text-sm text-stone-500">
              Assessment confidence:{" "}
              <span className="font-medium text-stone-800">{rubric.confidenceInAssessment}</span>
            </p>
            {rubric.biasAndQualityFlags.length > 0 ? (
              <ul className="space-y-3">
                {rubric.biasAndQualityFlags.map((flag) => (
                  <li
                    key={flag.flag}
                    className={`rounded-xl px-4 py-3 ring-1 ${
                      flag.severity === "Warning"
                        ? "bg-amber-50/80 ring-amber-100"
                        : "bg-stone-50/80 ring-stone-100"
                    }`}
                  >
                    <p className="text-sm font-medium text-stone-800">{flag.flag}</p>
                    <p className="mt-1 text-sm text-stone-600">{flag.suggestion}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-stone-500">No quality flags identified.</p>
            )}
            {rubric.recommendedFollowUpsBeforeDecision.length > 0 && (
              <div className="rounded-xl bg-accent-soft px-4 py-3 ring-1 ring-accent/10">
                <p className="text-xs font-semibold uppercase tracking-wider text-accent">
                  Suggested follow-ups
                </p>
                <ul className="mt-2 space-y-2">
                  {rubric.recommendedFollowUpsBeforeDecision.map((item) => (
                    <li key={item} className="flex gap-2 text-sm text-stone-700">
                      <span className="text-accent" aria-hidden="true">
                        →
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {tab === "messages" && (
          <div className="space-y-4">
            <MessageBlock
              title="Slack"
              copyButton={
                <CopyButton
                  label="Copy"
                  copyKey="slack"
                  text={formatSlackText(result)}
                  copiedKey={copiedKey}
                  onCopy={onCopy}
                />
              }
            >
              <p className="border-l-2 border-accent/40 pl-4 text-sm leading-relaxed text-stone-700">
                {pack.slackMessageDraft}
              </p>
            </MessageBlock>

            <MessageBlock
              title="Panel debrief"
              copyButton={
                <CopyButton
                  label="Copy"
                  copyKey="panel"
                  text={formatPanelDebriefText(result)}
                  copiedKey={copiedKey}
                  onCopy={onCopy}
                />
              }
            >
              <FormattedNotes content={pack.panelDebriefNotes} variant="debrief" />
            </MessageBlock>

            {pack.candidateFollowUpDraft && (
              <MessageBlock title="Candidate follow-up">
                <FormattedNotes content={pack.candidateFollowUpDraft} variant="letter" />
              </MessageBlock>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <CopyButton
          label="Copy full pack"
          copyKey="full"
          text={formatFullDebriefText(transcript, result, roleTitle)}
          copiedKey={copiedKey}
          onCopy={onCopy}
          variant="primary"
          className="flex-1"
        />
        <button
          type="button"
          onClick={() => downloadMarkdown(transcript, result, roleTitle)}
          className="inline-flex flex-1 items-center justify-center rounded-xl bg-surface px-4 py-2.5 text-sm font-medium text-stone-700 shadow-card ring-1 ring-stone-200/80 transition-all hover:shadow-card-hover"
        >
          Export markdown
        </button>
        <button
          type="button"
          onClick={onStartAgain}
          className="inline-flex flex-1 items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium text-stone-500 transition-colors hover:text-stone-800"
        >
          New debrief
        </button>
      </div>
    </section>
  );
}

function SummaryList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl bg-stone-50/80 p-4 ring-1 ring-stone-100">
      <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">{title}</p>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm leading-relaxed text-stone-700">
            <span className="text-stone-400" aria-hidden="true">
              •
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ScoreBadge({ score }: { score: string }) {
  const styles =
    score === "Strong"
      ? "bg-emerald-100 text-emerald-800 ring-emerald-200/60"
      : score === "Weak"
        ? "bg-rose-100 text-rose-800 ring-rose-200/60"
        : score === "Mixed"
          ? "bg-amber-100 text-amber-900 ring-amber-200/60"
          : "bg-stone-100 text-stone-600 ring-stone-200/60";

  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${styles}`}>
      {score}
    </span>
  );
}
