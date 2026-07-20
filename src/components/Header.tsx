export function Header() {
  return (
    <header className="border-b border-stone-200/80 bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-2xl items-center px-4 py-5 sm:px-6">
        <div className="flex items-center gap-2.5">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft text-accent"
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
              <path
                d="M8 6h8M8 10h8M8 14h5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M6 4h12v16H6V4Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-stone-800">
            InterviewDebrief
          </span>
        </div>
      </div>
    </header>
  );
}
