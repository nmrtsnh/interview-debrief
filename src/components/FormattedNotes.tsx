import type { ReactNode } from "react";
import {
  parseInlineParts,
  parseNotesMarkdown,
  parsePlainLetter,
} from "@/lib/formatNotes";

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  return parseInlineParts(text).map((part, index) =>
    part.type === "bold" ? (
      <strong key={`${keyPrefix}-${index}`} className="font-semibold text-stone-800">
        {part.value}
      </strong>
    ) : (
      part.value
    ),
  );
}

interface FormattedNotesProps {
  content: string;
  variant?: "debrief" | "letter";
}

export function FormattedNotes({ content, variant = "debrief" }: FormattedNotesProps) {
  if (variant === "letter") {
    const paragraphs = parsePlainLetter(content);
    return (
      <div className="space-y-3 text-sm leading-relaxed text-stone-700">
        {paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 48)}>{paragraph}</p>
        ))}
      </div>
    );
  }

  const blocks = parseNotesMarkdown(content);

  if (blocks.length === 0) {
    return <p className="text-sm text-stone-500">No debrief notes available.</p>;
  }

  return (
    <div className="space-y-3">
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`;

        if (block.type === "title") {
          return (
            <p key={key} className="text-base font-semibold text-stone-900">
              {renderInline(block.text, key)}
            </p>
          );
        }

        if (block.type === "heading") {
          return (
            <p
              key={key}
              className="border-t border-stone-200/80 pt-3 text-xs font-semibold uppercase tracking-wider text-stone-500 first:border-0 first:pt-0"
            >
              {block.text}
            </p>
          );
        }

        if (block.type === "bullet") {
          return (
            <div key={key} className="flex gap-3 text-sm leading-relaxed text-stone-700">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent/70" aria-hidden="true" />
              <p>{renderInline(block.text, key)}</p>
            </div>
          );
        }

        return (
          <p key={key} className="text-sm leading-relaxed text-stone-600">
            {renderInline(block.text, key)}
          </p>
        );
      })}
    </div>
  );
}

interface MessageBlockProps {
  title: string;
  copyButton?: ReactNode;
  children: ReactNode;
}

export function MessageBlock({ title, copyButton, children }: MessageBlockProps) {
  return (
    <div className="rounded-xl bg-stone-50/80 p-4 ring-1 ring-stone-100">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">{title}</p>
        {copyButton}
      </div>
      {children}
    </div>
  );
}
