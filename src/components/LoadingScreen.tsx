export default function LoadingScreen() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border border-line rounded-full animate-spin" style={{ borderTopColor: 'var(--color-accent)' }} />
        <p className="text-xs tracking-[0.2em] uppercase text-ink-muted font-body">Loading</p>
      </div>
    </div>
  );
}
