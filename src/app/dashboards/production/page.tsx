// src/app/dashboards/production/page.tsx
"use client";
import React, { useEffect, useMemo, useState } from "react";
import { productionOrdersService } from "@/Services/productionOrdersService";
import { Button } from "@/components/ui/button";
import ProductionTopItems from "@/components/ProductionTopItems";
import ProductionCostTimeline from "@/components/ProductionCostTimeline";
import { Card } from "@/components/ui/card";
import { ProductionItem } from "@/Types/production";
import { computeTotalUnits } from "@/Libs/productionUtils";
import CategoryGroupedItems from "@/components/CategoryGroupedItems";
import ProductionSummaryCard from "@/components/ProductionSummaryCard";

export default function ProductionDashboardPage() {
  const today = new Date();
  const defaultEnd = today.toISOString().slice(0, 10);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 29);
  const defaultStart = startDate.toISOString().slice(0, 10);

  const [start, setStart] = useState<string>(defaultStart);
  const [end, setEnd] = useState<string>(defaultEnd);
  const [plans, setPlans] = useState<Array<{ dateKey: string; displayDate: string; items: ProductionItem[]; source?: any }>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      // getPlansForRange já retorna um item por cada data no range (usa default fallback por dia)
      let data = await productionOrdersService.getPlansForRange(start, end);

      // defensive: ensure we have one entry per day (in case of odd gaps)
      const startD = new Date(start);
      const endD = new Date(end);
      const expectedDates: string[] = [];
      for (let d = new Date(startD); d <= endD; d.setDate(d.getDate() + 1)) expectedDates.push(d.toISOString().slice(0, 10));

      const existingDates = new Set(data.map((p) => p.dateKey));
      // fetch missing dates individually (should be rare)
      if (expectedDates.some((dt) => !existingDates.has(dt))) {
        const missing = expectedDates.filter((dt) => !existingDates.has(dt));
        for (const dt of missing) {
          const p = await productionOrdersService.getPlanForDate(dt);
          data.push({ dateKey: p.dateKey, displayDate: new Date(dt).toLocaleDateString(), items: p.items, source: p.source });
        }
        // sort ascending by dateKey
        data.sort((a, b) => a.dateKey.localeCompare(b.dateKey));
      }

      if (!mounted) return;
      setPlans(data);
      setLoading(false);
    }
    load();
    return () => { mounted = false; };
  }, [start, end]);

  const flattenedItems = useMemo<ProductionItem[]>(() => plans.flatMap((p) => p.items.map((it) => ({ ...it }))), [plans]);

  const totals = useMemo(() => {
    let revenue = 0, cost = 0;
    for (const p of plans) {
      for (const it of p.items) {
        const units = computeTotalUnits(it);
        revenue += (it.price ?? 0) * units;
        cost += (it.cost ?? 0) * units;
      }
    }
    return { revenue, cost, profit: revenue - cost };
  }, [plans]);

  return (
    <main className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard — Produção</h1>
          <p className="text-sm text-slate-600">Análise de receita, custo e lucros por item e por período.</p>
        </div>

        <div className="flex items-center gap-2">
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="border rounded px-2 py-1" />
          <span className="text-sm text-slate-500">até</span>
          <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="border rounded px-2 py-1" />
          <Button onClick={() => { /* apenas atualiza state para re-fetch */ }}>Aplicar</Button>
        </div>
      </div>

      {loading ? <p>Carregando...</p> : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            <Card className="p-4 hover:shadow-lg transition">
              <div className="text-sm text-slate-500">Receita estimada</div>
              <div className="text-2xl font-bold">R$ {totals.revenue.toFixed(2)}</div>
            </Card>

            <Card className="p-4 hover:shadow-lg transition">
              <div className="text-sm text-slate-500">Custo estimado</div>
              <div className="text-2xl font-bold">R$ {totals.cost.toFixed(2)}</div>
            </Card>

            <Card className="p-4 hover:shadow-lg transition">
              <div className="text-sm text-slate-500">Lucro estimado</div>
              <div className="text-2xl font-bold">R$ {totals.profit.toFixed(2)}</div>
            </Card>
          </div>

          {/* timeline ocupando 100% do grid (linha inteira) */}
          <div className="mb-4">
            <ProductionCostTimeline plans={plans.map(p => ({ dateKey: p.dateKey, items: p.items }))} />
          </div>

          <div className="mb-4 gap-4">
            <CategoryGroupedItems items={flattenedItems} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            {/* Top items ocupa 2 colunas (mais espaço para o gráfico) */}
            <div className="lg:col-span-2">
              <ProductionTopItems items={flattenedItems} topN={10} />
            </div>

            {/* Summary ocupa 1 coluna */}
            <div className="lg:col-span-1">
              <ProductionSummaryCard items={flattenedItems} />
            </div>
          </div>

          <div className="mt-4">
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-2">Tabela de Itens do Período</h3>
              <div className="overflow-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="text-left">
                      <th className="p-2 border-b">Item</th>
                      <th className="p-2 border-b">Qtd (equiv.)</th>
                      <th className="p-2 border-b">Receita</th>
                      <th className="p-2 border-b">Custo</th>
                      <th className="p-2 border-b">Lucro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {flattenedItems.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-slate-500">Nenhum dado</td></tr>}

                    {(() => {
                      const map = new Map<string, { name: string; units: number; revenue: number; cost: number }>();
                      for (const it of flattenedItems) {
                        const units = computeTotalUnits(it);
                        const revenue = (it.price ?? 0) * units;
                        const cost = (it.cost ?? 0) * units;
                        const prev = map.get(it.id);
                        if (prev) { prev.units += units; prev.revenue += revenue; prev.cost += cost; }
                        else { map.set(it.id, { name: it.name, units, revenue, cost }); }
                      }
                      const arr = Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
                      return arr.map((r) => (
                        <tr key={r.name}>
                          <td className="p-2 border-b">{r.name}</td>
                          <td className="p-2 border-b">{r.units.toLocaleString()}</td>
                          <td className="p-2 border-b">R$ {r.revenue.toFixed(2)}</td>
                          <td className="p-2 border-b">R$ {r.cost.toFixed(2)}</td>
                          <td className="p-2 border-b">R$ {(r.revenue - r.cost).toFixed(2)}</td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </>
      )}
    </main>
  );
}
