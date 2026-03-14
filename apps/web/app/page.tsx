import Link from "next/link";
import { DEFAULT_APP_NAME, getPlatformSummary, hasSupabaseEnv } from "@healthscope/config";
import { CORE_API_ROUTES, CORE_DOMAINS } from "@healthscope/data-model";
import { SessionSummary } from "../components/session-summary";

const summary = getPlatformSummary();

export default function HomePage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-8 lg:px-10">
      <div className="mb-8 flex flex-col gap-4 rounded-[28px] border border-slate-200/70 bg-white/68 px-6 py-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <span className="relative h-11 w-11 rounded-[18px] bg-[linear-gradient(135deg,#10b981,#f0a45d)]">
            <span className="absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/90" />
          </span>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              {DEFAULT_APP_NAME}
            </p>
            <p className="text-lg font-semibold text-slate-950">
              Healthcare analytics control plane
            </p>
          </div>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
          <span className="h-2 w-2 rounded-full bg-current" />
          Phase 1 bootstrap
        </div>
      </div>

      <section className="grid gap-6 xl:grid-cols-[1.32fr_0.88fr]">
        <article className="relative overflow-hidden rounded-[32px] border border-slate-200/70 bg-white/74 p-8 shadow-[0_24px_90px_rgba(15,23,42,0.10)] backdrop-blur xl:p-10">
          <div className="absolute -right-24 top-[-6rem] h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.22),rgba(16,185,129,0))]" />
          <div className="relative space-y-8">
            <div className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
              Healthcare analytics foundation
            </div>
            <div className="space-y-4">
              <h1 className="max-w-[11ch] text-5xl font-semibold tracking-[-0.05em] text-slate-950 md:text-6xl xl:text-7xl">
                Tenant-safe infrastructure for clinical and financial intelligence.
              </h1>
              <p className="max-w-3xl text-base leading-8 text-slate-600">
                The platform now includes a production-style Next.js shell, tenant-aware domain
                contracts, versioned REST route scaffolding, and Supabase-backed foundations for
                memberships, RBAC, integration registration, and audit coverage.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(16,185,129,0.28)] transition hover:bg-emerald-600"
                href="/sign-in"
              >
                Open sign-in
              </Link>
              <Link
                className="inline-flex items-center justify-center rounded-full border border-slate-300/80 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white"
                href="/api/v1/health"
              >
                Inspect API status
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <article className="rounded-3xl border border-slate-200/70 bg-white/72 p-5">
                <h3 className="text-sm font-semibold text-slate-500">Initial domains</h3>
                <p className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-slate-950">
                  {CORE_DOMAINS.length}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Auth, tenancy, compliance, warehouse, analytics.
                </p>
              </article>
              <article className="rounded-3xl border border-slate-200/70 bg-white/72 p-5">
                <h3 className="text-sm font-semibold text-slate-500">Core API routes</h3>
                <p className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-slate-950">
                  {CORE_API_ROUTES.length}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Versioned REST surface scaffolded under <code>/api/v1</code>.
                </p>
              </article>
              <article className="rounded-3xl border border-slate-200/70 bg-white/72 p-5">
                <h3 className="text-sm font-semibold text-slate-500">Freshness target</h3>
                <p className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-slate-950">
                  {summary.analyticsFreshness}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Hourly batch for MVP with event hooks reserved.
                </p>
              </article>
            </div>
          </div>
        </article>

        <div className="grid gap-6">
          <aside className="rounded-[28px] border border-slate-200/70 bg-white/72 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur">
            <h2 className="text-lg font-semibold text-slate-950">Locked architecture choices</h2>
            <ul className="mt-5 space-y-4">
              <li className="grid gap-1 border-t border-slate-200/70 pt-4 first:border-t-0 first:pt-0 md:grid-cols-[130px_1fr]">
                <span className="text-sm font-semibold text-slate-500">Interop</span>
                <span className="text-sm leading-6 text-slate-700">{summary.interopStrategy}</span>
              </li>
              <li className="grid gap-1 border-t border-slate-200/70 pt-4 md:grid-cols-[130px_1fr]">
                <span className="text-sm font-semibold text-slate-500">Tenancy</span>
                <span className="text-sm leading-6 text-slate-700">{summary.tenancyModel}</span>
              </li>
              <li className="grid gap-1 border-t border-slate-200/70 pt-4 md:grid-cols-[130px_1fr]">
                <span className="text-sm font-semibold text-slate-500">Compliance</span>
                <span className="text-sm leading-6 text-slate-700">
                  {summary.complianceBaseline}
                </span>
              </li>
            </ul>
          </aside>

          <SessionSummary configured={hasSupabaseEnv()} />

          <aside className="rounded-[28px] border border-slate-200/70 bg-white/72 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur">
            <h2 className="text-lg font-semibold text-slate-950">Core route groups</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {CORE_API_ROUTES.map((route) => (
                <div
                  className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4"
                  key={route.path}
                >
                  <code className="block text-sm font-semibold text-emerald-700">{route.path}</code>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{route.summary}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
