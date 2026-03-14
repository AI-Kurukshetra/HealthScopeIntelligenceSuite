type SessionSummaryProps = {
  configured: boolean;
};

export function SessionSummary({ configured }: SessionSummaryProps) {
  return (
    <aside className="rounded-[28px] border border-slate-200/70 bg-white/70 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">Auth runtime</h2>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            configured ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
          }`}
        >
          {configured ? "Connected" : "Needs env"}
        </span>
      </div>
      <ul className="space-y-4">
        <li className="grid gap-1 border-t border-slate-200/70 pt-4 first:border-t-0 first:pt-0 md:grid-cols-[140px_1fr]">
          <span className="text-sm font-semibold text-slate-500">Session source</span>
          <span className="text-sm text-slate-700">
            {configured ? "Supabase server session" : "Bootstrap mode until env is configured"}
          </span>
        </li>
        <li className="grid gap-1 border-t border-slate-200/70 pt-4 md:grid-cols-[140px_1fr]">
          <span className="text-sm font-semibold text-slate-500">Tenant scope</span>
          <span className="text-sm text-slate-700">
            Derived from active membership and optional `x-healthscope-tenant-id` selection.
          </span>
        </li>
        <li className="grid gap-1 border-t border-slate-200/70 pt-4 md:grid-cols-[140px_1fr]">
          <span className="text-sm font-semibold text-slate-500">Compliance path</span>
          <span className="text-sm text-slate-700">
            Audit routes enforce session state and active tenant context before returning data.
          </span>
        </li>
      </ul>
    </aside>
  );
}
