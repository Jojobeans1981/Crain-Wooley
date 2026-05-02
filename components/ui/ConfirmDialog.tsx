'use client'

export function ConfirmDialog(props: {
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="border border-vault-border bg-vault-wall p-4">
      <div className="font-display text-lg font-semibold text-vault-parchment">{props.title}</div>
      <div className="text-base font-sans text-vault-parchment mt-2">{props.message}</div>
      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={props.onConfirm}
          className="bg-vault-gold text-vault-void font-mono text-xs font-medium uppercase tracking-widest px-4 py-2 rounded-none hover:bg-vault-goldmute transition-colors"
        >
          Confirm
        </button>
        <button
          type="button"
          onClick={props.onCancel}
          className="border border-vault-border text-vault-steel font-mono text-xs uppercase tracking-widest px-4 py-2 rounded-none hover:border-vault-gold hover:text-vault-gold transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

