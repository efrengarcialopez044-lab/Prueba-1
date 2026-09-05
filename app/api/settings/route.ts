import { NextResponse } from "next/server";
import { updatePropertySettings } from "@/lib/db";
import { propertySettingsSchema } from "@/lib/validations";
import { getIsAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** PUT /api/settings — admin only, updates the property's configuration. */
export async function PUT(request: Request) {
  if (!(await getIsAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = propertySettingsSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }

  const property = await updatePropertySettings(parsed.data);
  return NextResponse.json({ property });
}
