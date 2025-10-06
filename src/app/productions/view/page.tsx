// src/app/productions/view/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import ProductionDayCard from "@/components/ProductionDayCard";
import ProductionRangeModal from "@/components/ProductionRangeModal";
import { productionOrdersService } from "@/Services/productionOrdersService";
import { Button } from "@/components/ui/button";

export default function ProductionsViewPage() {
  const todayKey = new Date().toISOString().slice(0, 10);
  const [todayPlan, setTodayPlan] = useState<{ dateKey: string; items: any[]; source?: any } | null>(null);
  const [rangeOpen, setRangeOpen] = useState(false);
  const [rangePlans, setRangePlans] = useState<Array<{ dateKey: string; displayDate: string; items: any[]; source?: any }>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    productionOrdersService.getPlanForDate(todayKey).then((p) => {
      if (!mounted) return;
      setTodayPlan({ ...p, source: p.source });
    }).finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [todayKey]);

  const handleApplyRange = async (start: string, end: string) => {
    setLoading(true);
    const plans = await productionOrdersService.getPlansForRange(start, end);
    setRangePlans(plans);
    setRangeOpen(false);
    setLoading(false);
  };

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Planejamentos de Produção</h1>
        <div className="flex gap-2">
          <Button onClick={() => setRangeOpen(true)}>Filtrar por intervalo</Button>
        </div>
      </div>

      <ProductionRangeModal open={rangeOpen} onOpenChange={setRangeOpen} onApply={handleApplyRange} initialStart={todayKey} initialEnd={todayKey} />

      {loading && <p>Carregando...</p>}

      <section className="space-y-4 mb-6">
        <h2 className="text-lg font-semibold">Ordem do dia ({new Date(todayKey).toLocaleDateString()})</h2>
        {todayPlan ? (
          <ProductionDayCard
            dateKey={todayPlan.dateKey}
            displayDate={new Date(todayPlan.dateKey).toLocaleDateString()}
            items={todayPlan.items}
            source={todayPlan.source}
          />
        ) : (
          <p>Sem planejamento para hoje.</p>
        )}
      </section>

      {rangePlans.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">Resultados do intervalo</h2>
          <div className="space-y-4">
            {rangePlans.map((p) => (
              <ProductionDayCard
                key={p.dateKey}
                dateKey={p.dateKey}
                displayDate={p.displayDate}
                items={p.items}
                source={p.source}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
