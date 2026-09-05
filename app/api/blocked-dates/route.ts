import { NextResponse } from "next/server";
import { addBlockedDate, getBlockedDates } from "@/lib/db";
import { blockDatesSchema } from "@/lib/validations";
import { getIsAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const blockedDates = await getBlockedDates();
  return NextResponse.json({ blockedDates });
}

/** POST /api/blocked-dates — admin only, manually blocks a date range. */
export async function POST(request: Request) {
  if (!(await getIsAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = blockDatesSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }

  const blocked = await addBlockedDate(parsed.data);
  return NextResponse.json({ blockedDate: blocked }, { status: 201 });
}
