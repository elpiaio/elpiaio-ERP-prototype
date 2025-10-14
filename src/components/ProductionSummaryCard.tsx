// src/Components/ProductionSummaryCard.tsx
"use client";
import React, { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { ProductionItem } from "@/Types/production";
import { computeTotalUnits } from "@/Libs/productionUtils";
import { Button } from "@/components/ui/button";

/**
 * ProductionSummaryCard
 * Recebe flattenedItems (array de ProductionItem) e exibe KPIs e insights rápidos.
 */

type Props = {
  items: ProductionItem[];
};

function fmtCurrency(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function fmtNumber(n: number) {
  return n.toLocaleString("pt-BR");
}

export default function ProductionSummaryCard({ items }: Props) {
  const summary = useMemo(() => {
    const distinctItems = new Map<string, ProductionItem>();
    let totalUnits = 0;
    let totalRevenue = 0;
    let totalCost = 0;
    let frituraUnits = 0;

    for (const it of items) {
      distinctItems.set(it.id, it);
      const units = computeTotalUnits(it);
      totalUnits += units;
      totalRevenue += (it.price ?? 0) * units;
      totalCost += (it.cost ?? 0) * units;
      if ((it.method ?? "").toLowerCase() === "fritura") frituraUnits += units;
    }

    const avgPrice = totalUnits > 0 ? totalRevenue / totalUnits : 0;
    const avgCost = totalUnits > 0 ? totalCost / totalUnits : 0;
    const profit = totalRevenue - totalCost;

    // aggregate by category
    const byCategory = new Map<string, { units: number; revenue: number; cost: number }>();
    for (const it of items) {
      const cat = it.category ?? "Sem categoria";
      const units = computeTotalUnits(it);
      const rev = (it.price ?? 0) * units;
      const cst = (it.cost ?? 0) * units;
      const prev = byCategory.get(cat) ?? { units: 0, revenue: 0, cost: 0 };
      prev.units += units;
      prev.revenue += rev;
      prev.cost += cst;
      byCategory.set(cat, prev);
    }
    const topCategory = Array.from(byCategory.entries()).sort((a, b) => b[1].revenue - a[1].revenue)[0];

    // items with negative margin (price < cost per unit)
    const negativeMarginItems = new Map<string, { name: string; avgPrice: number; avgCost: number; units: number }>();
    const itemAgg = new Map<string, { name: string; units: number; revenue: number; cost: number }>();
    for (const it of items) {
      const units = computeTotalUnits(it);
      const rev = (it.price ?? 0) * units;
      const cst = (it.cost ?? 0) * units;
      const prev = itemAgg.get(it.id) ?? { name: it.name, units: 0, revenue: 0, cost: 0 };
      prev.units += units;
      prev.revenue += rev;
      prev.cost += cst;
      itemAgg.set(it.id, prev);
    }
    for (const [id, a] of itemAgg.entries()) {
      const avgP = a.units > 0 ? a.revenue / a.units : 0;
      const avgC = a.units > 0 ? a.cost / a.units : 0;
      if (avgP < avgC) {
        negativeMarginItems.set(id, { name: a.name, avgPrice: avgP, avgCost: avgC, units: a.units });
      }
    }

    const percentFritura = totalUnits > 0 ? (frituraUnits / totalUnits) * 100 : 0;

    return {
      distinctCount: distinctItems.size,
      totalUnits,
      totalRevenue,
      totalCost,
      profit,
      avgPrice,
      avgCost,
      topCategory: topCategory ? { name: topCategory[0], ...topCategory[1] } : null,
      negativeMarginItems: Array.from(negativeMarginItems.values()).slice(0, 6),
      percentFritura,
    };
  }, [items]);

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Resumo Rápido</h3>
          <div className="text-sm text-slate-500">KPIs essenciais do período selecionado</div>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => {
            // export CSV quick: generate CSV text and download
            const rows = [["Item","Unidades","Receita (R$)","Custo (R$)","Lucro (R$)"]];
            const map = new Map<string, { name: string; units: number; revenue: number; cost: number }>();
            for (const it of items) {
              const units = computeTotalUnits(it);
              const rev = (it.price ?? 0) * units;
              const cst = (it.cost ?? 0) * units;
              const prev = map.get(it.id) ?? { name: it.name, units: 0, revenue: 0, cost: 0 };
              prev.units += units; prev.revenue += rev; prev.cost += cst;
              map.set(it.id, prev);
            }
            for (const v of map.values()) {
              rows.push([v.name, String(v.units), v.revenue.toFixed(2), v.cost.toFixed(2), (v.revenue - v.cost).toFixed(2)]);
            }
            const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `production_summary_${new Date().toISOString().slice(0,10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
          }}>Exportar CSV</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="p-3 bg-white rounded-md shadow-sm">
          <div className="text-xs text-slate-500">Itens distintos</div>
          <div className="text-lg font-semibold">{summary.distinctCount}</div>
        </div>

        <div className="p-3 bg-white rounded-md shadow-sm">
          <div className="text-xs text-slate-500">Total unidades (equiv.)</div>
          <div className="text-lg font-semibold">{fmtNumber(summary.totalUnits)}</div>
        </div>

        <div className="p-3 bg-white rounded-md shadow-sm">
          <div className="text-xs text-slate-500">Receita</div>
          <div className="text-lg font-semibold">{fmtCurrency(summary.totalRevenue)}</div>
        </div>

        <div className="p-3 bg-white rounded-md shadow-sm">
          <div className="text-xs text-slate-500">Custo</div>
          <div className="text-lg font-semibold">{fmtCurrency(summary.totalCost)}</div>
        </div>

        <div className="p-3 bg-white rounded-md shadow-sm">
          <div className="text-xs text-slate-500">Lucro</div>
          <div className={`text-lg font-semibold ${summary.profit < 0 ? "text-rose-600" : "text-emerald-700"}`}>{fmtCurrency(summary.profit)}</div>
        </div>

        <div className="p-3 bg-white rounded-md shadow-sm">
          <div className="text-xs text-slate-500">% Fritura</div>
          <div className="text-lg font-semibold">{summary.percentFritura.toFixed(1)}%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-500">Categoria com maior receita</div>
          <div className="font-medium">{summary.topCategory ? `${summary.topCategory.name} — ${fmtCurrency(summary.topCategory.revenue)}` : "—"}</div>
        </div>

        <div>
          <div className="text-sm text-slate-500 mb-2">Itens com margem negativa (preço &lt; custo)</div>
          {summary.negativeMarginItems.length === 0 ? (
            <div className="text-sm text-slate-500">Nenhum item com margem negativa</div>
          ) : (
            <ul className="text-sm space-y-1">
              {summary.negativeMarginItems.map((itm) => (
                <li key={itm.name} className="flex items-center justify-between">
                  <div className="truncate mr-4">{itm.name}</div>
                  <div className="text-xs text-slate-500">{fmtCurrency(itm.avgPrice)}/{fmtCurrency(itm.avgCost)} • {fmtNumber(itm.units)}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Card>
  );
}
