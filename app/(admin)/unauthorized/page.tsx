export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen bg-vault-void text-vault-parchment px-6 md:px-12 py-16">
      <div className="max-w-lg mx-auto border border-vault-border bg-vault-chamber p-8">
        <div className="font-mono text-xs uppercase tracking-widest text-vault-steel mb-2">Admin Access</div>
        <h1 className="font-display text-2xl font-semibold text-vault-parchment">Access Not Authorized</h1>
        <p className="text-base font-sans text-vault-parchment mt-3">
          Access not authorized. Contact your administrator.
        </p>
      </div>
    </main>
  )
}

