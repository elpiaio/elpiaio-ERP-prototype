// src/Components/ProductionDayCard.tsx
"use client";
import React from "react";
import { ProductionItem } from "@/Types/production";
import { computeTotalUnits, breakdownLabel } from "@/Libs/productionUtils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Star, CalendarCheck } from "lucide-react";

type Source = "saved" | "personalized" | "default" | "fallback";

type Props = {
  dateKey: string; // YYYY-MM-DD
  displayDate?: string; // DD/MM/YYYY
  items: ProductionItem[];
  source?: Source;
  compact?: boolean;
};

function SourceBadge({ source }: { source?: Source }) {
  if (!source) return null;
  const mapping: Record<Source, { label: string; tone: string }> = {
    saved: { label: "Personalizado (salvo)", tone: "bg-rose-100 text-rose-800" },
    personalized: { label: "Personalizado", tone: "bg-amber-100 text-amber-800" },
    default: { label: "Padrão", tone: "bg-sky-100 text-sky-800" },
    fallback: { label: "Fallback", tone: "bg-gray-100 text-gray-800" },
  };
  const cfg = mapping[source];
  return <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${cfg.tone}`}>{cfg.label}</span>;
}

export default function ProductionDayCard({ dateKey, displayDate, items, source }: Props) {
  const router = useRouter();
  const totalUnits = items.reduce((s, it) => s + computeTotalUnits(it), 0);
  const todayKey = new Date().toISOString().slice(0, 10);
  const isToday = dateKey === todayKey;

  return (
    <Card className="p-4 shadow-sm hover:shadow-md transition">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="text-lg font-semibold">{displayDate ?? dateKey}</div>
            {isToday ? (
              <div title="Hoje" className="flex items-center gap-1 text-amber-600">
                <Star className="w-4 h-4" /> <span className="text-sm text-amber-700">Hoje</span>
              </div>
            ) : null}
          </div>

          <div className="ml-2">
            <SourceBadge source={source} />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm text-slate-600 mr-4">Itens: <strong>{items.length}</strong></div>
          <div className="text-sm text-slate-600 mr-4">Total unidades: <strong>{totalUnits.toLocaleString()}</strong></div>
          <Button variant="outline" size="sm" onClick={() => router.push(`/productions/edit?date=${dateKey}`)}>
            <CalendarCheck className="mr-2 w-4 h-4" /> Editar
          </Button>
        </div>
      </div>

      <div className="mt-3 overflow-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="text-left">
              <th className="p-2 text-sm border-b">Item</th>
              <th className="p-2 text-sm border-b hidden md:table-cell">Categoria</th>
              <th className="p-2 text-sm border-b">Unidade</th>
              <th className="p-2 text-sm border-b text-right">Quantidade</th>
              <th className="p-2 text-sm border-b hidden lg:table-cell">Breakdown</th>
              <th className="p-2 text-sm border-b text-right">Unidades Totais</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id}>
                <td className="p-2 align-top">
                  <div className="font-medium">{it.name}</div>
                  <div className="text-xs text-slate-500">{it.subcategory ?? ""}</div>
                </td>
                <td className="p-2 align-top hidden md:table-cell">{it.category}</td>
                <td className="p-2 align-top">{it.unit}</td>
                <td className="p-2 align-top text-right">{it.quantity.toLocaleString()}</td>
                <td className="p-2 align-top hidden lg:table-cell">{it.breakdown ? breakdownLabel(it) : "—"}</td>
                <td className="p-2 align-top text-right font-semibold">{computeTotalUnits(it).toLocaleString()}</td>
              </tr>
            ))}

            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-slate-500">Nenhum item para esse dia.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
