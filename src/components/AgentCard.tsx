import type { AgentStatus } from "@/types/debrief";

interface AgentStepProps {
  label: string;
  status: AgentStatus;
  isLast?: boolean;
}

const statusConfig: Record<
  AgentStatus,
  { label: string; dot: string; line: string; text: string }
> = {
  waiting: {
    label: "Waiting",
    dot: "border-stone-200 bg-stone-50 text-stone-400",
    line: "bg-stone-200",
    text: "text-stone-400",
  },
  working: {
    label: "Running",
    dot: "border-accent bg-accent text-white",
    line: "bg-accent/30",
    text: "text-accent",
  },
  complete: {
    label: "Done",
    dot: "border-emerald-200 bg-emerald-50 text-emerald-700",
    line: "bg-emerald-200",
    text: "text-emerald-700",
  },
  error: {
    label: "Failed",
    dot: "border-red-200 bg-red-50 text-red-600",
    line: "bg-red-200",
    text: "text-red-600",
  },
};

export function AgentStep({ label, status, isLast }: AgentStepProps) {
  const config = statusConfig[status];

  return (
    <div className="flex flex-1 items-center gap-0">
      <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
        <div
          className={`flex h-7 w-7 items-center justify-center rounded-full border text-[10px] font-semibold ${config.dot}`}
        >
          {status === "complete" ? <CheckIcon /> : status === "working" ? <SpinnerDot /> : null}
        </div>
        <p className="truncate text-[11px] font-medium text-stone-700">{label}</p>
        <p className={`text-[10px] ${config.text}`}>{config.label}</p>
      </div>
      {!isLast && (
        <div className={`mb-5 h-px w-full min-w-[12px] flex-1 ${config.line}`} aria-hidden="true" />
      )}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M16.704 5.29a1 1 0 0 1 0 1.42l-7.25 7.25a1 1 0 0 1-1.42 0l-3.25-3.25a1 1 0 1 1 1.42-1.42l2.54 2.54 6.54-6.54a1 1 0 0 1 1.42 0Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function SpinnerDot() {
  return (
    <span
      className="inline-block h-2.5 w-2.5 rounded-full border-2 border-white/40 border-t-white motion-safe:animate-spin-slow"
      aria-hidden="true"
    />
  );
}
