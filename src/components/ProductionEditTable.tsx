// src/Components/ProductionEditTable.tsx
"use client";
import React, { useEffect, useMemo, useState } from "react";
import { planningService } from "@/Services/planningService";
import { ProductionPlan, ProductionPlanItem } from "@/Types/planning";
import { ProductionItem } from "@/Types/production";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ProductionItemSelect from "./ProductionItemSelect";
import { computeTotalUnits, breakdownLabel } from "@/Libs/productionUtils";
import { Input } from "@/components/ui/input";

function toDateInputValue(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toISOString().slice(0, 10); // YYYY-MM-DD
}

export default function ProductionEditTable() {
  const [date, setDate] = useState<string>(toDateInputValue(new Date())); // YYYY-MM-DD
  const [plan, setPlan] = useState<ProductionPlan | null>(null);
  const [workingItems, setWorkingItems] = useState<ProductionPlanItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [dirty, setDirty] = useState(false); // unsaved changes

  // load plan when date changes
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    planningService.getOrCreateDefaultPlanForDate(date).then((p) => {
      if (!mounted) return;
      setPlan(p);
      setWorkingItems(p.items.map((it) => ({ ...it })));
      setDirty(false);
    }).finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [date]);

  // helper to update an item quantity
  const updateQuantity = (id: string, q: number) => {
    setWorkingItems((prev) => {
      const next = prev.map((it) => (it.id === id ? { ...it, quantity: q } : it));
      setDirty(true);
      return next;
    });
  };

  // remove item
  const removeItem = (id: string) => {
    setWorkingItems((prev) => {
      setDirty(true);
      return prev.filter((it) => it.id !== id);
    });
  };

  // add item (if exists increase quantity)
  const addItem = (p: ProductionItem) => {
    setWorkingItems((prev) => {
      const exists = prev.find((it) => it.id === p.id);
      let next;
      if (exists) {
        next = prev.map((it) => (it.id === p.id ? { ...it, quantity: it.quantity + p.quantity } : it));
      } else {
        next = [...prev, { ...p }];
      }
      setDirty(true);
      return next;
    });
  };

  const handleSave = async () => {
    if (!plan) return;
    const toSave: ProductionPlan = {
      ...plan,
      items: workingItems,
      updatedAt: new Date().toISOString(),
    };
    await planningService.savePlan(toSave);
    setPlan(toSave);
    setDirty(false);
    alert("Planejamento salvo.");
  };

  const handleCancel = () => {
    // revert to plan loaded initially
    if (plan) {
      setWorkingItems(plan.items.map((it) => ({ ...it })));
      setDirty(false);
    }
  };

  const totalUnits = useMemo(() => workingItems.reduce((s, it) => s + computeTotalUnits(it), 0), [workingItems]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium">Data da Ordem de Produção</label>
          <input
            type="date"
            className="border rounded px-2 py-1"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={!dirty}>Salvar</Button>
          <Button variant="ghost" onClick={handleCancel} disabled={!dirty}>Cancelar</Button>
        </div>
      </div>

      <Card className="p-4">
        {loading ? (
          <p>Carregando plano...</p>
        ) : (
          <>
            <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="col-span-2">
                <ProductionItemSelect onSelect={addItem} placeholder="Adicionar item de produção..." />
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-500">Total (unidades equivalentes)</div>
                <div className="text-2xl font-bold">{totalUnits.toLocaleString()}</div>
              </div>
            </div>

            <div className="overflow-auto">
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr className="text-left">
                    <th className="p-2 border-b">Item</th>
                    <th className="p-2 border-b hidden md:table-cell">Categoria</th>
                    <th className="p-2 border-b">Unidade</th>
                    <th className="p-2 border-b w-40">Quantidade</th>
                    <th className="p-2 border-b hidden lg:table-cell">Breakdown</th>
                    <th className="p-2 border-b w-28 text-right">Unidades Totais</th>
                    <th className="p-2 border-b w-24">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {workingItems.map((it) => (
                    <tr key={it.id} className="align-top">
                      <td className="p-2 border-b">
                        <div className="font-medium">{it.name}</div>
                        <div className="text-xs text-slate-500">{it.subcategory ?? ""}</div>
                      </td>

                      <td className="p-2 border-b hidden md:table-cell">{it.category}</td>

                      <td className="p-2 border-b">{it.unit}</td>

                      <td className="p-2 border-b">
                        <Input
                          type="number"
                          value={it.quantity}
                          onChange={(e) => updateQuantity(it.id, Math.max(0, Number(e.target.value || 0)))}
                          min={0}
                        />
                      </td>

                      <td className="p-2 border-b hidden lg:table-cell">
                        {it.breakdown ? (
                          <div className="text-sm">{breakdownLabel(it)}</div>
                        ) : (
                          <div className="text-sm text-slate-500">—</div>
                        )}
                      </td>

                      <td className="p-2 border-b text-right">
                        <div className="font-semibold">{computeTotalUnits(it).toLocaleString()}</div>
                      </td>

                      <td className="p-2 border-b">
                        <div className="flex gap-2">
                          <Button size="sm" variant="destructive" onClick={() => removeItem(it.id)}>Remover</Button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {workingItems.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-4 text-center text-slate-500">Nenhum item na lista — adicione itens pelo campo acima.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
