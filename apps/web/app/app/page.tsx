import Link from "next/link";
import { requireAppSession } from "../../lib/auth-guards";

function FeedbackBanner({
  tone,
  message
}: {
  tone: "success" | "error";
  message: string;
}) {
  const toneClassName =
    tone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-rose-200 bg-rose-50 text-rose-700";

  return <p className={`rounded-2xl border px-4 py-3 text-sm ${toneClassName}`}>{message}</p>;
}

export default async function AppHomePage({
  searchParams
}: {
  searchParams?: {
    success?: string;
    error?: string;
  };
}) {
  const session = await requireAppSession();
  const activeTenant = session.context.activeTenant;

  return (
    <>
      <section className="rounded-[32px] border border-slate-200/70 bg-white/78 p-8 shadow-[0_24px_90px_rgba(15,23,42,0.10)] backdrop-blur xl:p-10">
        <div className="space-y-6">
          <div className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Authenticated workspace
          </div>

          <div className="space-y-4">
            <h1 className="max-w-4xl text-4xl font-semibold tracking-[-0.04em] text-slate-950 md:text-5xl">
              Platform access is now backed by Supabase session state.
            </h1>
            <p className="max-w-3xl text-base leading-8 text-slate-600">
              This slice provides a real authenticated shell, tenant-aware navigation, and an
              admin console for managing organizations, facilities, memberships, and source
              systems against the hosted Supabase project.
            </p>
          </div>

          <div className="space-y-3">
            {searchParams?.success ? (
              <FeedbackBanner message={searchParams.success} tone="success" />
            ) : null}
            {searchParams?.error ? <FeedbackBanner message={searchParams.error} tone="error" /> : null}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <article className="rounded-3xl border border-slate-200/80 bg-white/80 p-5">
              <h3 className="text-sm font-semibold text-slate-500">User</h3>
              <p className="mt-3 break-words text-xl font-semibold text-slate-950">
                {session.context.actor.email}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Full name: {session.context.actor.fullName ?? "Not set"}
              </p>
            </article>
            <article className="rounded-3xl border border-slate-200/80 bg-white/80 p-5">
              <h3 className="text-sm font-semibold text-slate-500">Memberships</h3>
              <p className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-slate-950">
                {session.context.memberships.length}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Across assigned tenant and organization scopes.
              </p>
            </article>
            <article className="rounded-3xl border border-slate-200/80 bg-white/80 p-5">
              <h3 className="text-sm font-semibold text-slate-500">Active tenant</h3>
              <p className="mt-3 break-words text-xl font-semibold text-slate-950">
                {activeTenant?.tenantId ?? "Unassigned"}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {activeTenant
                  ? `Organization ${activeTenant.organizationId}`
                  : "Ask a tenant admin to assign a membership."}
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-slate-200/70 bg-white/78 p-8 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur xl:p-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-[-0.03em] text-slate-950">
              Next admin actions
            </h2>
            <div className="mt-5 space-y-4">
              <div className="grid gap-1 border-t border-slate-200/70 pt-4 first:border-t-0 first:pt-0 md:grid-cols-[170px_1fr]">
                <span className="text-sm font-semibold text-slate-500">Dashboard</span>
                <span className="text-sm leading-6 text-slate-700">
                  Use the new dashboard for executive KPIs across clinical, financial, and operational metrics.
                </span>
              </div>
              <div className="grid gap-1 border-t border-slate-200/70 pt-4 first:border-t-0 first:pt-0 md:grid-cols-[170px_1fr]">
                <span className="text-sm font-semibold text-slate-500">Analytics view</span>
                <span className="text-sm leading-6 text-slate-700">
                  Review the first warehouse-backed tenant metrics for clinical, financial, and operational activity.
                </span>
              </div>
              <div className="grid gap-1 border-t border-slate-200/70 pt-4 md:grid-cols-[170px_1fr]">
                <span className="text-sm font-semibold text-slate-500">Tenant switching</span>
                <span className="text-sm leading-6 text-slate-700">
                  Switch the active tenant in the sidebar when your user belongs to more than one.
                </span>
              </div>
              <div className="grid gap-1 border-t border-slate-200/70 pt-4 md:grid-cols-[170px_1fr]">
                <span className="text-sm font-semibold text-slate-500">User management</span>
                <span className="text-sm leading-6 text-slate-700">
                  Edit user display name, role, scope, and suspension status from tenant admin.
                </span>
              </div>
              <div className="grid gap-1 border-t border-slate-200/70 pt-4 md:grid-cols-[170px_1fr]">
                <span className="text-sm font-semibold text-slate-500">FHIR sources</span>
                <span className="text-sm leading-6 text-slate-700">
                  Register hosted EHR endpoints and set batch sync schedules from integrations.
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(16,185,129,0.28)] transition hover:bg-emerald-600"
              href="/app/dashboard"
            >
              Open dashboard
            </Link>
            <Link
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(16,185,129,0.28)] transition hover:bg-emerald-600"
              href="/app/analytics"
            >
              Open analytics
            </Link>
            <Link
              className="inline-flex items-center justify-center rounded-full border border-slate-300/80 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white"
              href="/app/admin"
            >
              Open tenant admin
            </Link>
            <Link
              className="inline-flex items-center justify-center rounded-full border border-slate-300/80 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white"
              href="/app/integrations"
            >
              Open integrations
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
