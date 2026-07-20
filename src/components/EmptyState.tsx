export function EmptyState() {
  return (
    <section
      aria-labelledby="empty-heading"
      className="rounded-lg border border-dashed border-slate-200 bg-white px-4 py-5 text-center sm:px-5"
    >
      <h2 id="empty-heading" className="text-sm font-semibold text-navy">
        Your hiring decision pack will appear here.
      </h2>
      <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-slate-600 sm:text-sm">
        Generate a scorecard, rubric analysis, panel debrief, and draft recommendation
        from a single post-interview voice note.
      </p>
    </section>
  );
}
