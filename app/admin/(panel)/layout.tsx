import { getProperty } from "@/lib/db";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { Sidebar } from "@/components/admin/Sidebar";
import { LogoutButton } from "@/components/admin/LogoutButton";

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const property = await getProperty();

  return (
    <div className="flex min-h-screen bg-sand-50">
      <Sidebar propertyName={property.name} />
      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-sand-200 bg-white px-8 py-4">
          {!isSupabaseConfigured && (
            <p className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
              Modo demo — datos de ejemplo en memoria
            </p>
          )}
          <div className="ml-auto">
            <LogoutButton isSupabaseConfigured={isSupabaseConfigured} />
          </div>
        </header>
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
