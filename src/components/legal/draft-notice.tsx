// Every legal page carries this until the user confirms a qualified review
// has happened — per docs/requirements-matrix.md, legal review is an
// explicit launch blocker this build cannot supply on its own.
export function DraftNotice() {
  return (
    <div className="border-honey-amber/40 bg-honey-amber/10 mb-10 rounded-xl border p-4 text-sm">
      <p className="text-honey-amber font-semibold">Draft — not yet legally reviewed</p>
      <p className="text-porcelain/70 mt-1">
        This page is a working draft based on how the site actually operates today. It hasn&apos;t
        been checked by a qualified legal adviser and shouldn&apos;t be relied on until it has.
      </p>
    </div>
  )
}
