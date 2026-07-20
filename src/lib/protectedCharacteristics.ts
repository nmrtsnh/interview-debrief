/** Terms that must never be inferred or evaluated in quality flags. */
export const PROTECTED_CHARACTERISTIC_TERMS = [
  "age",
  "gender",
  "race",
  "ethnicity",
  "religion",
  "disability",
  "pregnancy",
  "nationality",
  "marital",
  "family status",
  "sexual orientation",
  "political",
  "accent",
  "pronoun",
  "appearance",
] as const;

export function containsProtectedCharacteristicReference(text: string): boolean {
  const lower = text.toLowerCase();
  return PROTECTED_CHARACTERISTIC_TERMS.some((term) => {
    const escaped = term.replace(/\s+/g, "\\s+");
    return new RegExp(`\\b${escaped}\\b`, "i").test(lower);
  });
}

export function assertNoProtectedCharacteristicReference(text: string, field: string): void {
  if (containsProtectedCharacteristicReference(text)) {
    throw new Error(`Protected characteristic reference detected in ${field}`);
  }
}
