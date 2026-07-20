export function sanitizeFilenamePart(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function buildExportFilename(candidateName: string, roleTitle: string): string {
  const name = sanitizeFilenamePart(candidateName) || "candidate";
  const role = sanitizeFilenamePart(roleTitle) || "role";
  return `interview-debrief-${name}-${role}.md`;
}

export function normalizeCandidateName(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function isValidCandidateName(value: string): boolean {
  return normalizeCandidateName(value).length > 0;
}
