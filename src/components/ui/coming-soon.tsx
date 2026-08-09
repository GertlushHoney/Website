export function ComingSoon({ title, note }: { title: string; note?: string }) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-32 text-center">
      <p className="text-honey-amber text-sm font-semibold tracking-wide uppercase">Coming soon</p>
      <h1 className="mt-4 text-4xl font-bold tracking-tight text-balance">{title}</h1>
      <p className="text-porcelain/70 mt-4 text-base">
        {note ??
          'This section is part of the planned Gert Lush Honey site and is being built next. Nothing here is final content.'}
      </p>
    </div>
  )
}
