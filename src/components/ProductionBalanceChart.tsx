// src/Components/ProductionBalanceChart.tsx
"use client";
import React, { useMemo } from "react";
import { ProductionItem } from "@/Types/production";
import { computeTotalUnits } from "@/Libs/productionUtils";
import {
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Bar,
  Legend
} from "recharts";

type Props = {
  items: ProductionItem[];
  height?: number;
};

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function toNumber(value: any): number {
  if (value === undefined || value === null) return 0;
  if (typeof value === "number") return value;
  const n = Number(String(value).replace(",", "."));
  return isNaN(n) ? 0 : n;
}

export default function ProductionBalanceChart({ items, height = 220 }: Props) {
  // compute totals and per-item breakdown (coerce values safely)
  const { totalCost, totalRevenue, totalProfit, rows } = useMemo(() => {
    let c = 0;
    let r = 0;
    const rowsAcc: Array<{ id: string; name: string; units: number; costPer: number; pricePer: number; costTotal: number; revenueTotal: number }> = [];

    for (const it of items) {
      const units = computeTotalUnits(it) || 0;
      // cost and price may be undefined or strings in mocks — coerce to number
      const costPer = toNumber((it as any).cost);
      const pricePer = toNumber((it as any).price);
      const costTotal = units * costPer;
      const revenueTotal = units * pricePer;

      c += costTotal;
      r += revenueTotal;

      rowsAcc.push({
        id: it.id,
        name: it.name,
        units,
        costPer,
        pricePer,
        costTotal,
        revenueTotal,
      });
    }

    return { totalCost: c, totalRevenue: r, totalProfit: r - c, rows: rowsAcc };
  }, [items]);

  // prepare data for recharts
  const data = [
    {
      name: "Produção",
      custo: Number(totalCost.toFixed(2)),
      receita: Number(totalRevenue.toFixed(2)),
      lucro: Number((totalRevenue - totalCost).toFixed(2)),
    },
  ];

  const allZero = totalCost === 0 && totalRevenue === 0 && totalProfit === 0;

  return (
    <div className="w-full" style={{ height }}>
      {allZero ? (
        <div className="p-4 border rounded bg-yellow-50 text-sm text-slate-800">
          <div className="font-medium mb-2">Sem dados financeiros disponíveis</div>
          <div>O gráfico não pôde ser gerado porque custo e/ou preço estão zerados ou ausentes nos itens.</div>
          <div className="mt-3 text-xs text-slate-600">
            Verifique se os itens possuem os campos <code>cost</code> e <code>price</code> nos seus mocks ou se foram passados corretamente ao componente.
          </div>

          {/* debug compacto: tabela por item */}
          <div className="mt-3 overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500">
                  <th className="pb-2">Item</th>
                  <th className="pb-2">Unidades</th>
                  <th className="pb-2">Custo/un.</th>
                  <th className="pb-2">Preço/un.</th>
                  <th className="pb-2">Custo total</th>
                  <th className="pb-2">Receita total</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="pt-2">{r.name}</td>
                    <td className="pt-2">{r.units.toLocaleString()}</td>
                    <td className="pt-2">{currency.format(r.costPer)}</td>
                    <td className="pt-2">{currency.format(r.pricePer)}</td>
                    <td className="pt-2">{currency.format(r.costTotal)}</td>
                    <td className="pt-2">{currency.format(r.revenueTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 16, right: 12, left: 6, bottom: 6 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : `${v}`)} />
              <Tooltip formatter={(value: number) => currency.format(value)} />
              <Legend />
              <Bar dataKey="custo" name="Custo" stackId="a" fill="#f43f5e" />
              <Bar dataKey="receita" name="Receita" stackId="a" fill="#06b6d4" />
              <Bar dataKey="lucro" name="Lucro" fill="#34d399" />
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-2 text-sm text-slate-600">
            <div>Custo total: <strong>{currency.format(totalCost)}</strong></div>
            <div>Receita estimada: <strong>{currency.format(totalRevenue)}</strong></div>
            <div>Lucro estimado: <strong>{currency.format(totalProfit)}</strong></div>
          </div>
        </>
      )}
    </div>
  );
}
