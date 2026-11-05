export default function Loading() {
  return (
    <div className="flex h-screen items-center justify-center" role="status" aria-busy="true">
      <p className="text-sm text-slate-500">Loading workspace…</p>
    </div>
  )
}
