export type NoteBlock =
  | { type: "title"; text: string }
  | { type: "heading"; text: string }
  | { type: "bullet"; text: string }
  | { type: "paragraph"; text: string };

export type InlinePart = { type: "text"; value: string } | { type: "bold"; value: string };

/** Strip markdown asterisks for plain-text copy */
export function stripMarkdown(text: string): string {
  return text.replace(/\*\*([^*]+)\*\*/g, "$1").replace(/^[-*]\s+/gm, "• ");
}

export function parseInlineParts(text: string): InlinePart[] {
  const parts: InlinePart[] = [];
  const regex = /(\*\*[^*]+\*\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }
    parts.push({ type: "bold", value: match[0].slice(2, -2) });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: "text", value: text.slice(lastIndex) });
  }

  return parts.length > 0 ? parts : [{ type: "text", value: text }];
}

function cleanLine(line: string): string {
  return line.trim().replace(/^[-*]\s+/, "");
}

function isHeadingLine(line: string): boolean {
  const trimmed = line.trim();
  return (
    /^\*\*[^*]+\*\*$/.test(trimmed) ||
    (/^[A-Z][^a-z]*:$/.test(trimmed) && trimmed.length < 48)
  );
}

function headingText(line: string): string {
  const trimmed = line.trim();
  if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
    return trimmed.slice(2, -2);
  }
  return trimmed.replace(/:$/, "");
}

export function parseNotesMarkdown(raw: string): NoteBlock[] {
  const blocks: NoteBlock[] = [];
  const lines = raw.split("\n");
  let paragraphBuffer: string[] = [];

  const flushParagraph = () => {
    if (paragraphBuffer.length === 0) return;
    const text = paragraphBuffer.join(" ").trim();
    if (text) blocks.push({ type: "paragraph", text });
    paragraphBuffer = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushParagraph();
      continue;
    }

    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      flushParagraph();
      blocks.push({ type: "bullet", text: cleanLine(trimmed) });
      continue;
    }

    if (isHeadingLine(trimmed)) {
      flushParagraph();
      const text = headingText(trimmed);
      blocks.push({
        type: blocks.length === 0 ? "title" : "heading",
        text,
      });
      continue;
    }

    paragraphBuffer.push(trimmed);
  }

  flushParagraph();
  return blocks;
}

export function parsePlainLetter(raw: string): string[] {
  return raw
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}
