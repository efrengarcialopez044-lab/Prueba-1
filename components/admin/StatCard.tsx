import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card>
      <CardContent>
        <div className="flex items-center gap-2 text-forest-800/60">
          <Icon className="h-4 w-4" />
          <span className="text-sm">{label}</span>
        </div>
        <p className="mt-3 font-serif text-3xl text-forest-800">{value}</p>
        {hint && <p className="mt-1 text-xs text-forest-800/50">{hint}</p>}
      </CardContent>
    </Card>
  );
}
