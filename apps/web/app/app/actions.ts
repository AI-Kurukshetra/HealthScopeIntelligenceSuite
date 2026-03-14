"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACTIVE_TENANT_COOKIE_NAME, getAccessibleTenantIds } from "@healthscope/auth";
import { requireSession } from "@healthscope/auth/server";

export async function switchTenantAction(formData: FormData) {
  const session = await requireSession();

  if (!session.ok) {
    redirect("/sign-in");
  }

  const tenantId = String(formData.get("tenantId") ?? "").trim();

  if (!tenantId || !getAccessibleTenantIds(session.context).includes(tenantId)) {
    redirect("/app?error=Unable%20to%20switch%20tenant");
  }

  const cookieStore = await cookies();
  cookieStore.set({
    name: ACTIVE_TENANT_COOKIE_NAME,
    value: tenantId,
    httpOnly: true,
    sameSite: "lax",
    path: "/"
  });

  redirect(`/app?success=Switched%20to%20tenant%20${encodeURIComponent(tenantId)}`);
}
