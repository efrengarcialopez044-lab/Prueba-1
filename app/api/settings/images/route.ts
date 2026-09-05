import { NextResponse } from "next/server";
import { z } from "zod";
import { addPropertyImage } from "@/lib/db";
import { getIsAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const addImageSchema = z.object({
  url: z.string().trim().url("Introduce una URL de imagen válida"),
  alt: z.string().trim().min(1).max(160),
});

/** POST /api/settings/images — admin only, adds a photo by URL. */
export async function POST(request: Request) {
  if (!(await getIsAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = addImageSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }

  const image = await addPropertyImage(parsed.data);
  return NextResponse.json({ image }, { status: 201 });
}
