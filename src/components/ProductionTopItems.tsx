// src/Components/ProductionTopItems.tsx
"use client";

import React, { useMemo } from "react";
import { ProductionItem } from "@/Types/production";
import { computeTotalUnits } from "@/Libs/productionUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TrendingUp, Package } from "lucide-react";

// --- TIPOS E INTERFACES ---
type Props = {
  items: ProductionItem[];
  topN?: number;
};

type ProcessedRow = {
  id: string;
  name: string;
  revenue: number;
  cost: number;
  profit: number;
};


/** Formata um número para o padrão de moeda BRL. */
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

/** Processa a lista de itens de produção para agregar dados. */
function processProductionData(items: ProductionItem[]) {
  const map = new Map<string, ProcessedRow>();
  let totalRevenue = 0;

  for (const item of items) {
    const units = computeTotalUnits(item);
    const price = item.price ?? 0;
    const costPer = item.cost ?? 0;

    const revenue = units * price;
    const cost = units * costPer;
    const profit = revenue - cost;

    const prev = map.get(item.id);
    if (prev) {
      prev.revenue += revenue;
      prev.cost += cost;
      prev.profit += profit;
    } else {
      map.set(item.id, { id: item.id, name: item.name, revenue, cost, profit });
    }
    totalRevenue += revenue;
  }

  const sortedRows = Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
  return { rows: sortedRows, totalRevenue };
}


// --- SUBCOMPONENTES ---

/** Renderiza uma única linha da lista de itens. */
const TopItemRow = ({ item, totalRevenue, rank }: { item: ProcessedRow; totalRevenue: number; rank: number }) => {
  const percentage = totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium truncate">
          {rank}. {item.name}
        </span>
        <span className="text-sm font-semibold">{percentage.toFixed(1)}%</span>
      </div>
      <Progress value={percentage} className="h-2" />
      <div className="flex justify-between items-center mt-1 text-xs text-muted-foreground">
        <span>Receita: {formatCurrency(item.revenue)}</span>
        <span>Lucro: {formatCurrency(item.profit)}</span>
      </div>
    </div>
  );
};

/** Renderiza o estado de "sem dados". */
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
    <Package size={40} className="mb-2" />
    <p className="text-sm">Sem dados de produção para exibir.</p>
  </div>
);


// --- COMPONENTE PRINCIPAL ---

export default function ProductionTopItems({ items, topN = 5 }: Props) {
  const { rows, totalRevenue } = useMemo(() => processProductionData(items), [items]);

  const topRows = rows.slice(0, topN);
  const otherItemsCount = rows.length - topN;

  const chartData = topRows.map((r) => ({
    name: r.name,
    Receita: r.revenue,
  })).reverse(); // Reverter para o maior ficar no topo no gráfico vertical

  if (rows.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <TrendingUp className="mr-2 h-5 w-5" />
            Top Itens por Receita
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <EmptyState />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <TrendingUp className="mr-2 h-5 w-5" />
          Top Itens por Receita
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Coluna da Lista */}
          <div className="space-y-4">
            {topRows.map((row, index) => (
              <TopItemRow 
                key={row.id} 
                item={row} 
                totalRevenue={totalRevenue} 
                rank={index + 1} 
              />
            ))}
            {otherItemsCount > 0 && (
              <p className="text-sm text-center text-muted-foreground pt-2">
                + {otherItemsCount} outros itens
              </p>
            )}
          </div>
          
          {/* Coluna do Gráfico */}
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis 
                  type="number" 
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${Number(value) / 1000}k`}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  width={120} // Ajuste conforme necessário
                  tick={{ dy: 2 }}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted))" }}
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Bar 
                  dataKey="Receita" 
                  radius={[0, 8, 8, 0]} 
                  fill="hsl(var(--primary))" 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}