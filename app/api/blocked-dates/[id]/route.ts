import { NextResponse } from "next/server";
import { removeBlockedDate } from "@/lib/db";
import { getIsAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface Params {
  params: Promise<{ id: string }>;
}

/** DELETE /api/blocked-dates/:id — admin only, unblocks a date range. */
export async function DELETE(_request: Request, { params }: Params) {
  if (!(await getIsAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await params;
  await removeBlockedDate(id);
  return NextResponse.json({ success: true });
}
