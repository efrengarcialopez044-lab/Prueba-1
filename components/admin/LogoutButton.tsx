"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function LogoutButton({ isSupabaseConfigured }: { isSupabaseConfigured: boolean }) {
  const router = useRouter();

  async function handleLogout() {
    if (isSupabaseConfigured) {
      const { createClient } = await import("@/lib/supabase/client");
      await createClient().auth.signOut();
    }
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleLogout}>
      <LogOut className="h-4 w-4" /> Cerrar sesión
    </Button>
  );
}
