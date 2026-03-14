import { getIntegrationOverview } from "../../../lib/admin";
import { requireTenantAdminSession } from "../../../lib/auth-guards";
import { DataTable, type DataTableColumn } from "../../../components/data-table";
import { createFhirSourceAction, updateDataSourceStatusAction } from "./actions";

const inputClassName =
  "w-full rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100";

const labelClassName = "text-xs font-semibold uppercase tracking-[0.16em] text-slate-500";

const sourceColumns: Array<
  DataTableColumn<{
    name: string;
    organization: string;
    endpoint: string;
    auth: string;
    sync: string;
    status: string;
  }>
> = [
  { key: "name", header: "Name" },
  { key: "organization", header: "Organization" },
  { key: "endpoint", header: "Endpoint", variant: "mono" },
  { key: "auth", header: "Auth" },
  { key: "sync", header: "Sync" },
  { key: "status", header: "Status" }
];

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

export default async function IntegrationsPage({
  searchParams
}: {
  searchParams?: {
    success?: string;
    error?: string;
  };
}) {
  const session = await requireTenantAdminSession();
  const overview = await getIntegrationOverview(session.context);
  const sourceRows = overview.dataSources.map((source) => ({
    name: source.name,
    organization:
      overview.organizations.find((organization) => organization.id === source.organization_id)?.name ??
      source.organization_id,
    endpoint: source.base_url,
    auth: source.auth_type,
    sync: source.sync_frequency,
    status: source.status
  }));

  return (
    <>
      <section className="rounded-[32px] border border-slate-200/70 bg-white/78 p-8 shadow-[0_24px_90px_rgba(15,23,42,0.10)] backdrop-blur xl:p-10">
        <div className="space-y-6">
          <div className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Integrations
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-[-0.04em] text-slate-950 md:text-5xl">
              Register FHIR source systems for hourly analytics syncs.
            </h1>
            <p className="max-w-3xl text-base leading-8 text-slate-600">
              This first integration screen covers source registration metadata only. Credential
              management and checkpoint orchestration are still deferred, but tenant admins can now
              register hosted FHIR endpoints and manage source status.
            </p>
          </div>

          <div className="space-y-3">
            {searchParams?.success ? (
              <FeedbackBanner message={searchParams.success} tone="success" />
            ) : null}
            {searchParams?.error ? <FeedbackBanner message={searchParams.error} tone="error" /> : null}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[30px] border border-slate-200/70 bg-white/78 p-7 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur">
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-slate-950">
            Register FHIR source
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Capture the source metadata needed to stage extraction and future sync orchestration.
          </p>

          <form action={createFhirSourceAction} className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="block space-y-2 md:col-span-2">
              <span className={labelClassName}>Organization</span>
              <select className={inputClassName} name="organizationId" required defaultValue="">
                <option value="" disabled>
                  Select organization
                </option>
                {overview.organizations.map((organization) => (
                  <option key={organization.id} value={organization.id}>
                    {organization.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-2 md:col-span-2">
              <span className={labelClassName}>Source name</span>
              <input className={inputClassName} name="name" placeholder="Epic FHIR Production" required />
            </label>
            <label className="block space-y-2 md:col-span-2">
              <span className={labelClassName}>FHIR base URL</span>
              <input
                className={inputClassName}
                name="baseUrl"
                placeholder="https://ehr.example.com/fhir/R4"
                required
              />
            </label>
            <label className="block space-y-2">
              <span className={labelClassName}>Auth type</span>
              <select className={inputClassName} defaultValue="oauth2" name="authType">
                <option value="oauth2">OAuth 2.0</option>
                <option value="basic">Basic auth</option>
                <option value="api-key">API key</option>
                <option value="none">None</option>
              </select>
            </label>
            <label className="block space-y-2">
              <span className={labelClassName}>Sync frequency</span>
              <select className={inputClassName} defaultValue="hourly" name="syncFrequency">
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="manual">Manual</option>
              </select>
            </label>
            <button
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(16,185,129,0.28)] transition hover:bg-emerald-600 md:col-span-2"
              type="submit"
            >
              Register FHIR source
            </button>
          </form>
        </div>

        <div className="rounded-[30px] border border-slate-200/70 bg-white/78 p-7 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur">
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-slate-950">
            Integration posture
          </h2>
          <div className="mt-5 space-y-4">
            <div className="rounded-3xl border border-slate-200/80 bg-white/85 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Current mode
              </p>
              <p className="mt-3 text-lg font-semibold text-slate-950">Metadata-first onboarding</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Source registration is live. Secrets, token refresh, and incremental checkpoints are
                still pending.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200/80 bg-white/85 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Freshness target
              </p>
              <p className="mt-3 text-lg font-semibold text-slate-950">Hourly analytics sync</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                The registration model already captures the cadence field that future orchestrators
                will use for batched pulls.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200/80 bg-white/85 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Source count
              </p>
              <p className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-slate-950">
                {overview.dataSources.length}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Registered source systems in the active tenant.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[30px] border border-slate-200/70 bg-white/78 p-7 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur">
        <h2 className="text-2xl font-semibold tracking-[-0.03em] text-slate-950">
          Registered source systems
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Source records currently staged for the active tenant.
        </p>

        <div className="mt-6">
          <DataTable
            columns={sourceColumns}
            data={sourceRows}
            emptyMessage="No FHIR sources registered for this tenant yet."
          />
        </div>

        {overview.dataSources.length > 0 ? (
          <div className="mt-6 grid gap-4">
            {overview.dataSources.map((source) => (
              <form
                action={updateDataSourceStatusAction}
                className="rounded-[28px] border border-slate-200/80 bg-white/85 p-5 shadow-sm"
                key={source.id}
              >
                <input name="sourceId" type="hidden" value={source.id} />
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div className="space-y-1">
                    <strong className="block text-lg font-semibold text-slate-950">
                      {source.name}
                    </strong>
                    <span className="block font-mono text-xs text-slate-500">{source.base_url}</span>
                  </div>
                  <div className="flex flex-wrap items-end gap-3">
                    <label className="block space-y-2">
                      <span className={labelClassName}>Status</span>
                      <select className={inputClassName} defaultValue={source.status} name="status">
                        <option value="active">Active</option>
                        <option value="paused">Paused</option>
                        <option value="error">Error</option>
                      </select>
                    </label>
                    <button
                      className="inline-flex items-center justify-center rounded-full border border-slate-300/80 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      type="submit"
                    >
                      Save status
                    </button>
                  </div>
                </div>
              </form>
            ))}
          </div>
        ) : null}
      </section>
    </>
  );
}
