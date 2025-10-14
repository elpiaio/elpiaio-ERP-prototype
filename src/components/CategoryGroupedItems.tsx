"use client";
import React, { useMemo } from "react";
import { ProductionItem } from "@/Types/production";
import { computeTotalUnits, breakdownLabel } from "@/Libs/productionUtils";
import { Card } from "@/components/ui/card";

/**
 * Agrupa por categoria e, no hover, mostra itens únicos com total agregado.
 */

type Props = { items: ProductionItem[]; maxColumns?: number };

export default function CategoryGroupedItems({ items, maxColumns = 4 }: Props) {
  // groups: category => { itemsMap: Map<itemId, { item, totalUnits, totalBaseQuantityEquivalent }> }
  const groups = useMemo(() => {
    const catMap = new Map<
      string,
      {
        itemsMap: Map<
          string,
          {
            item: ProductionItem;
            totalUnits: number; // unidades equivalentes somadas
            totalQuantitySum: number; // soma da "quantity" original (útil para referenciar)
          }
        >;
        totalUnits: number;
      }
    >();

    for (const it of items) {
      const cat = it.category ?? "Sem categoria";
      const units = computeTotalUnits(it); // unidades equivalentes dessa ocorrência
      const q = it.quantity ?? 0;

      let catEntry = catMap.get(cat);
      if (!catEntry) {
        catEntry = { itemsMap: new Map(), totalUnits: 0 };
        catMap.set(cat, catEntry);
      }

      const existing = catEntry.itemsMap.get(it.id);
      if (existing) {
        existing.totalUnits += units;
        existing.totalQuantitySum += q;
      } else {
        catEntry.itemsMap.set(it.id, { item: it, totalUnits: units, totalQuantitySum: q });
      }

      catEntry.totalUnits += units;
    }

    // convert to array sorted by totalUnits desc
    return Array.from(catMap.entries())
      .map(([category, data]) => ({
        category,
        items: Array.from(data.itemsMap.values()),
        totalUnits: data.totalUnits,
      }))
      .sort((a, b) => b.totalUnits - a.totalUnits);
  }, [items]);

  if (groups.length === 0) {
    return (
      <Card className="p-4">
        <div className="text-sm text-slate-500">Nenhuma categoria encontrada para o período.</div>
      </Card>
    );
  }

  const gridColsClass = `grid-cols-1 sm:grid-cols-2 lg:grid-cols-${Math.min(maxColumns, 6)}`;

  // helper para formatar número com separador pt-BR
  const fmt = (n: number) => n.toLocaleString("pt-BR");

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Itens por Categoria</h3>

      <div className={`grid ${gridColsClass} gap-3`}>
        {groups.map((g) => (
          <div key={g.category} className="relative group">
            <Card className="p-3 hover:shadow-lg transition">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm text-slate-500">Categoria</div>
                  <div className="text-lg font-semibold truncate">{g.category}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    {g.items.length} item{g.items.length > 1 ? "s" : ""} · Total: <strong>{fmt(g.totalUnits)}</strong> unidades
                  </div>
                </div>

                <div className="text-right">
                  {g.items.length > 0 ? (() => {
                    const top = [...g.items].sort((a, b) => b.totalUnits - a.totalUnits)[0];
                    return (
                      <>
                        <div className="text-sm text-slate-500">Maior</div>
                        <div className="font-medium truncate" style={{ maxWidth: 140 }}>{top.item.name}</div>
                        <div className="text-xs text-slate-500">{fmt(top.totalUnits)} unidades</div>
                      </>
                    );
                  })() : null}
                </div>
              </div>
            </Card>

            {/* Hover detail panel - AGREGADO por item */}
            <div
              className="pointer-events-none opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto transition
                         absolute z-50 top-0 left-1/2 transform -translate-x-1/2 -translate-y-full w-80"
              aria-hidden={!true}
            >
              <div className="bg-white border shadow-lg rounded-lg overflow-hidden">
                <div className="p-3 border-b">
                  <div className="text-sm font-semibold">{g.category}</div>
                  <div className="text-xs text-slate-500">Detalhes agregados por item</div>
                </div>

                <div className="max-h-64 overflow-auto p-2">
                  <table className="w-full text-sm">
                    <tbody>
                      {g.items
                        .slice()
                        .sort((a, b) => b.totalUnits - a.totalUnits)
                        .map(({ item, totalUnits }) => {
                          // if breakdown exists, show equivalent in level1 units (when meaningful)
                          const b = item.breakdown;
                          let equivalentLabel: string | null = null;
                          if (b && b.level2PerLevel1 && b.unitsPerLevel2) {
                            const unitsPerLevel1 = b.level2PerLevel1 * b.unitsPerLevel2;
                            const eqLevel1 = totalUnits / unitsPerLevel1;
                            equivalentLabel = `${fmt(eqLevel1)} ${b.level1Name}${Math.abs(eqLevel1) !== 1 ? "s" : ""} (equivalente)`;
                          }

                          return (
                            <tr key={item.id} className="border-b last:border-b-0">
                              <td className="py-2 pr-3 align-top">
                                <div className="font-medium truncate max-w-[11rem]">{item.name}</div>
                                <div className="text-xs text-slate-500">{item.subcategory ?? ""}</div>
                              </td>
                              <td className="py-2 text-right align-top">
                                <div className="font-semibold">{fmt(totalUnits)}</div>
                                <div className="text-xs text-slate-500">{item.unit}</div>
                                {equivalentLabel && <div className="text-xs text-slate-400 mt-1">{equivalentLabel}</div>}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>

                <div className="p-2 text-right text-xs text-slate-500 border-t">
                  Total categoria: <strong>{fmt(g.totalUnits)}</strong> unidades
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
