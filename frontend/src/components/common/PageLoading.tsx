export function PageLoading({ label = 'Loading…' }: { label?: string }) {
  return (
    <div
      className="flex min-h-[240px] w-full items-center justify-center"
      role="status"
      aria-busy="true"
    >
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  )
}
