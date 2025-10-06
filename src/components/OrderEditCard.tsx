// src/Components/OrderEditCard.tsx
"use client";
import React, { useMemo, useState } from "react";
import { Order, OrderItem } from "@/Types/order";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ProductSelect from "./ProductSelect";
import { Product } from "@/Types/product";
import { useOrderStore } from "@/Store/orderStore";
import { Label } from "@/components/ui/label";

type Props = {
  order: Order;
  onSaved?: (updated: Order) => void;
  onCancel?: () => void;
};

export default function OrderEditCard({ order, onSaved, onCancel }: Props) {
  const updateOrder = useOrderStore((s) => s.updateOrder);
  // local copy for editing
  const [draft, setDraft] = useState<Order>({ ...order });
  const [saving, setSaving] = useState(false);

  // recompute totals if items change
  const computedTotal = useMemo(() => {
    return draft.items.reduce((acc, it) => acc + (it.total ?? it.quantity * it.price), 0);
  }, [draft.items]);

  const setCustomer = (value: string) => setDraft((d) => ({ ...d, customerName: value }));
  const setNote = (value: string) => setDraft((d) => ({ ...d, note: value }));
  const setPickup = (value: string) => setDraft((d) => ({ ...d, pickupAt: value }));

  const updateItem = (productId: string, patch: Partial<OrderItem>) => {
    setDraft((d) => ({
      ...d,
      items: d.items.map((it) =>
        it.productId === productId ? { ...it, ...patch, total: ((patch.quantity ?? it.quantity) * (patch.price ?? it.price)) } : it
      ),
    }));
  };

  const removeItem = (productId: string) => {
    setDraft((d) => ({ ...d, items: d.items.filter((it) => it.productId !== productId) }));
  };

  const addItem = (p: Product) => {
    const exists = draft.items.find((it) => it.productId === p.id);
    if (exists) {
      updateItem(p.id, { quantity: exists.quantity + 1 });
      return;
    }
    const newIt: OrderItem = {
      productId: p.id,
      productName: p.name,
      quantity: 1,
      price: p.price,
      total: p.price * 1,
      product: p,
    };
    setDraft((d) => ({ ...d, items: [...d.items, newIt] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // ensure total is consistent
      const payload: Partial<Order> = {
        customerName: draft.customerName,
        items: draft.items.map((it) => ({ ...it, total: Number((it.quantity * it.price).toFixed(2)) })),
        total: Number(computedTotal.toFixed(2)),
        pickupAt: draft.pickupAt ?? null,
        note: draft.note,
        status: draft.status,
      };
      const updated = await updateOrder(order.id, payload);
      if (updated && onSaved) onSaved(updated as Order);
    } catch (err) {
      // could show a toast here
      console.error("save error", err);
      alert("Erro ao salvar pedido: " + (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDraft({ ...order });
    if (onCancel) onCancel();
  };

  return (
    <Card className="p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="text-lg font-semibold">{draft.customerName}</div>
          <div className="text-sm text-slate-500">{new Date(order.createdAt).toLocaleString()}</div>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={handleCancel}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>

      <div className="mt-3 space-y-3">
        <div>
          <Label>Cliente</Label>
          <Input value={draft.customerName} onChange={(e) => setCustomer(e.target.value)} />
        </div>

        <div>
          <Label>Buscar/Adicionar produto</Label>
          <ProductSelect onSelect={addItem} placeholder="Digite para buscar e adicionar..." />
        </div>

        <div>
          <Label>Itens</Label>
          <div className="mt-2 space-y-2">
            {draft.items.map((it) => (
              <div key={it.productId} className="flex items-center gap-2 border rounded p-2">
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{it.productName}</div>
                  <div className="text-xs text-slate-500">
                    {it.product?.category ?? ""}
                  </div>
                </div>

                <div className="w-24">
                  <Label className="text-xs">Qtd</Label>
                  <Input
                    type="number"
                    value={it.quantity}
                    onChange={(e) => updateItem(it.productId, { quantity: Math.max(1, Number(e.target.value || 1)) })}
                    min={1}
                  />
                </div>

                <div className="w-28">
                  <Label className="text-xs">Preço</Label>
                  <Input
                    type="number"
                    value={it.price}
                    onChange={(e) => updateItem(it.productId, { price: Number(e.target.value || 0) })}
                    step="0.01"
                    min="0"
                  />
                </div>

                <div className="w-28 text-right">
                  <Label className="text-xs">Total</Label>
                  <div className="font-semibold">R${(it.quantity * it.price).toFixed(2)}</div>
                </div>

                <div>
                  <Button variant="destructive" size="sm" onClick={() => removeItem(it.productId)}>Remover</Button>
                </div>
              </div>
            ))}
            {draft.items.length === 0 && <div className="text-sm text-slate-500">Nenhum item</div>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <Label>Horário de retirada (aprox.)</Label>
            <input
              type="datetime-local"
              value={draft.pickupAt ? new Date(draft.pickupAt).toISOString().slice(0, 16) : ""}
              onChange={(e) => setPickup(e.target.value)}
              className="mt-1 block w-full border rounded px-2 py-1"
            />
          </div>

          <div>
            <Label>Observações</Label>
            <Input value={draft.note ?? ""} onChange={(e) => setNote(e.target.value)} />
          </div>

          <div>
            <Label>Status</Label>
            <select
              value={draft.status ?? "pendente"}
              onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value as Order["status"] }))}
              className="mt-1 block w-full border rounded px-2 py-1"
            >
              <option value="pendente">Pendente</option>
              <option value="concluido">Concluído</option>
              <option value="cancelado">Cancelado</option>
            </select>

            <div className="mt-2 text-right">
              <div className="text-sm text-slate-500">Total</div>
              <div className="text-lg font-bold">R${computedTotal.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
