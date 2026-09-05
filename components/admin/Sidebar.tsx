"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarDays, ListChecks, Settings, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/reservas", label: "Reservas", icon: ListChecks },
  { href: "/admin/calendario", label: "Calendario", icon: CalendarDays },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings },
];

export function Sidebar({ propertyName }: { propertyName: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-sand-200 bg-white">
      <div className="border-b border-sand-200 px-6 py-5">
        <p className="text-xs uppercase tracking-wide text-forest-800/50">Panel de gestión</p>
        <p className="font-serif text-lg text-forest-800">{propertyName}</p>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {links.map((link) => {
          const active = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-forest-800 text-white"
                  : "text-forest-800/70 hover:bg-sand-100 hover:text-forest-800"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sand-200 p-4">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-forest-800/70 hover:bg-sand-100 hover:text-forest-800"
        >
          <Home className="h-4 w-4" />
          Ver web pública
        </Link>
      </div>
    </aside>
  );
}
