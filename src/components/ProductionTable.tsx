"use client";
import React, { useEffect, useMemo, useState } from "react";
import { productionService } from "@/Services/productionService";
import { ProductionItem } from "@/Types/production";
import { computeTotalUnits, breakdownLabel } from "@/Libs/productionUtils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type GroupBy = "category" | "subcategory" | "method" | "none";

export default function ProductionTable() {
  const [items, setItems] = useState<ProductionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupBy, setGroupBy] = useState<GroupBy>("category");
  const [showOnlyFritura, setShowOnlyFritura] = useState<"all" | "fritura" | "non">("all");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    productionService
      .getAll()
      .then((data) => {
        if (mounted) setItems(data);
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    return items.filter((it) => {
      if (showOnlyFritura === "all") return true;
      if (showOnlyFritura === "fritura") return (it.method ?? "").toLowerCase() === "fritura";
      return (it.method ?? "").toLowerCase() !== "fritura";
    });
  }, [items, showOnlyFritura]);

  const groups = useMemo(() => {
    if (groupBy === "none") return { All: filtered };
    return filtered.reduce<Record<string, ProductionItem[]>>((acc, it) => {
      // eslint-disable-next-line
      const key = (it as any)[groupBy] ?? (groupBy === "subcategory" ? "Sem subcategoria" : "Outros");
      acc[key] = acc[key] ?? [];
      acc[key].push(it);
      return acc;
    }, {});
  }, [filtered, groupBy]);

  const sortedGroupKeys = useMemo(() => {
    return Object.keys(groups).sort((a, b) => a.localeCompare(b));
  }, [groups]);

  if (loading) return <p>Carregando planejamento...</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-2">
          <Button variant={groupBy === "category" ? "default" : "ghost"} onClick={() => setGroupBy("category")}>Agrupar por Categoria</Button>
          <Button variant={groupBy === "subcategory" ? "default" : "ghost"} onClick={() => setGroupBy("subcategory")}>Agrupar por Subcategoria</Button>
          <Button variant={groupBy === "method" ? "default" : "ghost"} onClick={() => setGroupBy("method")}>Agrupar por Método</Button>
          <Button variant={groupBy === "none" ? "default" : "ghost"} onClick={() => setGroupBy("none")}>Sem Agrupamento</Button>
        </div>

        <div className="flex gap-2 items-center">
          <label className="text-sm">Filtro fritura:</label>
          <select 
            value={showOnlyFritura} 
            onChange={
              // eslint-disable-next-line
              (e) => setShowOnlyFritura(e.target.value as any)
            } 
            className="border rounded px-2 py-1"
          >
            <option value="all">Todos</option>
            <option value="fritura">Apenas fritura</option>
            <option value="non">Sem fritura</option>
          </select>
        </div>
      </div>

      {sortedGroupKeys.length === 0 ? (
        <p>Nenhum item de produção encontrado.</p>
      ) : (
        sortedGroupKeys.map((key) => {
          const groupItems = groups[key];
          // subtotal units for the group (sum of computeTotalUnits)
          const subtotalUnits = groupItems.reduce((s, it) => s + computeTotalUnits(it), 0);

          return (
            <section key={key}>
              <h3 className="text-lg font-semibold mb-2">{key} — subtotal total: {subtotalUnits.toLocaleString()} unidades</h3>

              <div className="grid gap-2">
                {groupItems.map((it) => {
                  const totalUnits = computeTotalUnits(it);
                  return (
                    <Card key={it.id} className="p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="text-lg font-semibold">{it.name}</div>
                            <div className="text-sm text-slate-500">
                              {it.category} · {it.subcategory ?? "—"} · {it.method ?? "—"}
                            </div>
                          </div>

                          <div className="text-right hidden sm:block">
                            <div className="text-sm text-slate-500">Unidade base</div>
                            <div className="font-bold">{it.quantity} {it.unit}</div>
                          </div>
                        </div>

                        <div className="mt-2 text-sm text-slate-700">
                          {it.breakdown ? (
                            <>
                              <div>{breakdownLabel(it)}</div>
                              <div className="mt-1 text-xs text-slate-500">Total equivalente em unidades: <strong>{totalUnits.toLocaleString()}</strong></div>
                            </>
                          ) : (
                            <div>Quantidade: <strong>{it.quantity} {it.unit}</strong></div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <div className="text-sm text-slate-500">Total unidades</div>
                        <div className="text-2xl font-bold">{totalUnits.toLocaleString()}</div>
                        <div>
                          <Button size="sm" variant="ghost" onClick={() => navigator.clipboard?.writeText(`${it.name}: ${totalUnits} unidades`).catch(()=>{})}>
                            Copiar
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
