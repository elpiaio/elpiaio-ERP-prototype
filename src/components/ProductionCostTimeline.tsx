// src/Components/ProductionCostTimeline.tsx
"use client";
import React, { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { ProductionItem } from "@/Types/production";
import { computeTotalUnits } from "@/Libs/productionUtils";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

type Period = "day" | "month" | "year";
type DayPlan = { dateKey: string; items: ProductionItem[]; };

export default function ProductionCostTimeline({ plans }: { plans: DayPlan[] }) {
  const [period, setPeriod] = useState<Period>("day");

  const data = useMemo(() => {
    const map = new Map<string, { cost: number; revenue: number }>();
    for (const p of plans) {
      const bucketKeyDay = p.dateKey; // YYYY-MM-DD
      const key = period === "day" ? bucketKeyDay : (period === "month" ? bucketKeyDay.slice(0, 7) : bucketKeyDay.slice(0, 4));
      let accum = map.get(key);
      if (!accum) accum = { cost: 0, revenue: 0 };
      for (const it of p.items) {
        const units = computeTotalUnits(it);
        accum.cost += (it.cost ?? 0) * units;
        accum.revenue += (it.price ?? 0) * units;
      }
      map.set(key, accum);
    }

    const keys = Array.from(map.keys()).sort();
    return keys.map(k => {
      const { cost, revenue } = map.get(k)!;
      return { x: k, cost: Number(cost.toFixed(2)), revenue: Number(revenue.toFixed(2)), profit: Number((revenue - cost).toFixed(2)) };
    });
  }, [plans, period]);

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Evolução do custo / receita</h3>
        <div className="flex gap-2">
          <button className={`px-3 py-1 rounded ${period === "day" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-700"}`} onClick={() => setPeriod("day")}>Dia</button>
          <button className={`px-3 py-1 rounded ${period === "month" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-700"}`} onClick={() => setPeriod("month")}>Mês</button>
          <button className={`px-3 py-1 rounded ${period === "year" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-700"}`} onClick={() => setPeriod("year")}>Ano</button>
        </div>
      </div>

      <div className="rounded-lg overflow-hidden bg-white/50" style={{ height: 360 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 24, left: 6, bottom: 6 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="x" />
            <YAxis tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(1)}k` : `${v}`} />
            <Tooltip formatter={(val: number) => val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} />
            <Line type="monotone" dataKey="cost" name="Custo" stroke="#f43f5e" strokeWidth={3} dot={{ r: 3 }} strokeLinecap="round" />
            <Line type="monotone" dataKey="revenue" name="Receita" stroke="#06b6d4" strokeWidth={3} dot={{ r: 3 }} strokeLinecap="round" />
            <Line type="monotone" dataKey="profit" name="Lucro" stroke="#34d399" strokeWidth={3} dot={false} strokeLinecap="round" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
