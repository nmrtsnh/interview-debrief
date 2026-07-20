import {
  CopyButton,
  downloadMarkdown,
  formatFullDebriefText,
} from "@/components/CopyButton";
import type { DebriefResult } from "@/types/debrief";

interface BottomActionsProps {
  transcript: string;
  result: DebriefResult;
  roleTitle: string;
  copiedKey: string | null;
  onCopy: (key: string, text: string) => void;
  onStartAgain: () => void;
}

export function BottomActions({
  transcript,
  result,
  roleTitle,
  copiedKey,
  onCopy,
  onStartAgain,
}: BottomActionsProps) {
  return (
    <section aria-label="Debrief actions" className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <CopyButton
          label="Copy Full Pack"
          copyKey="full"
          text={formatFullDebriefText(transcript, result, roleTitle)}
          copiedKey={copiedKey}
          onCopy={onCopy}
          variant="primary"
          className="w-full sm:w-auto"
        />
        <button
          type="button"
          onClick={() => downloadMarkdown(transcript, result, roleTitle)}
          className="inline-flex w-full items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-navy transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 sm:w-auto"
        >
          Export Markdown
        </button>
        <button
          type="button"
          onClick={onStartAgain}
          className="inline-flex w-full items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 sm:ml-auto sm:w-auto"
        >
          Start Again
        </button>
      </div>
    </section>
  );
}
