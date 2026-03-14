import { redirect } from "next/navigation";
import { canManageTenantContext } from "@healthscope/auth";
import { requireSession } from "@healthscope/auth/server";

export async function requireAppSession() {
  const session = await requireSession();

  if (!session.ok) {
    redirect("/sign-in");
  }

  return session;
}

export async function requireTenantAdminSession() {
  const session = await requireAppSession();

  if (!session.context.activeTenant) {
    redirect("/app");
  }

  if (!canManageTenantContext(session.context, session.context.activeTenant.tenantId)) {
    redirect("/app");
  }

  return session;
}
