import Link from "next/link";
import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { LoginForm } from "@/components/admin/LoginForm";
import { isSupabaseConfigured } from "@/lib/supabase/server";

interface Props {
  searchParams: Promise<{ redirectTo?: string }>;
}

export const metadata: Metadata = {
  title: "Acceso propietario",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({ searchParams }: Props) {
  const { redirectTo } = await searchParams;
  const target = redirectTo ?? "/admin";

  return (
    <div className="flex min-h-screen items-center justify-center bg-sand-50 px-4">
      <Card className="w-full max-w-sm">
        <CardContent>
          <p className="mb-1 text-xs uppercase tracking-wide text-terracotta-600">
            Acceso propietario
          </p>
          <h1 className="mb-6 font-serif text-2xl text-forest-800">Panel de administración</h1>

          {isSupabaseConfigured ? (
            <LoginForm redirectTo={target} />
          ) : (
            <div className="space-y-4">
              <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
                Supabase no está configurado todavía: la app funciona en modo demo con datos de
                ejemplo, así que puedes entrar directamente al panel.
              </p>
              <ButtonLink href={target} className="w-full justify-center">
                Entrar al panel de demo
              </ButtonLink>
            </div>
          )}

          <Link
            href="/"
            className="mt-6 block text-center text-sm text-forest-800/60 hover:text-forest-800"
          >
            ← Volver a la web
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
