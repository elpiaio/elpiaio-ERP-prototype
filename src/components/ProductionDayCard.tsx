// src/Components/ProductionDayCard.tsx
"use client";
import React, { useState } from "react";
import { ProductionItem } from "@/Types/production";
import { computeTotalUnits, breakdownLabel } from "@/Libs/productionUtils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Star, CalendarCheck, ChartBar as ChartColumnBig } from "lucide-react";
import ProductionBalanceChart from "./ProductionBalanceChart";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

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

  const [chartOpen, setChartOpen] = useState(false);

  return (
    <>
      <Card className="p-4 shadow-sm hover:shadow-md transition">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="text-lg font-semibold">{displayDate ?? dateKey}</div>
                {isToday ? (
                  <div title="Hoje" className="flex items-center gap-1 text-amber-600 select-none">
                    <Star className="w-4 h-4" /> <span className="text-sm text-amber-700">Hoje</span>
                  </div>
                ) : null}
              </div>
              <div className="ml-2">
                <SourceBadge source={source} />
              </div>
            </div>

            <div className="mt-2 flex flex-wrap gap-4 items-center">
              <div className="text-sm text-slate-600">Itens: <strong>{items.length}</strong></div>
              <div className="text-sm text-slate-600">Total unidades: <strong>{totalUnits.toLocaleString()}</strong></div>
              <div className="ml-auto flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => router.push(`/productions/edit?date=${dateKey}`)}>
                  <CalendarCheck className="mr-2 w-4 h-4" /> Editar
                </Button>

                {/* botão para abrir modal do gráfico */}
                <Button variant="ghost" size="sm" onClick={() => setChartOpen(true)} title="Ver balanço">
                  <ChartColumnBig className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="mt-4 overflow-auto">
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
                        <div className="text-xs text-slate-500 mt-1">
                          <span className="mr-2">Custo: <strong>R${(it.cost ?? 0).toFixed(2)}</strong></span>
                          <span>Preço: <strong>R${(it.price ?? 0).toFixed(2)}</strong></span>
                        </div>
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
          </div>
        </div>
      </Card>

      {/* Modal grande com o gráfico */}
      <Dialog open={chartOpen} onOpenChange={setChartOpen}>
        <DialogContent className="sm:max-w-4xl w-full">
          <DialogHeader>
            <DialogTitle>Balanço da produção — {displayDate ?? dateKey}</DialogTitle>
          </DialogHeader>

          <div className="py-2">
            <ProductionBalanceChart items={items} height={380} />
          </div>

          <DialogFooter className="mt-4">
            <div className="ml-auto">
              <Button onClick={() => setChartOpen(false)}>Fechar</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
