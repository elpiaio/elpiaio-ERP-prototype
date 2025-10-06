// src/Components/FilterModal.tsx
"use client";
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OrderFilter } from "@/Types/filter";
import { useOrderStore } from "@/Store/orderStore";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (filter: OrderFilter) => void;
  initial?: OrderFilter;
};

export default function FilterModal({ open, onOpenChange, onApply, initial }: Props) {
  const [filter, setFilter] = useState<OrderFilter>(initial ?? {});
  const orders = useOrderStore((s) => s.orders);

  useEffect(() => setFilter(initial ?? {}), [initial]);

  // collect unique createdBy users from orders to populate creator select
  const creators = Array.from(new Set(orders.map((o) => o.createdBy ?? "Sem usuário"))).filter(Boolean);

  function handleClear() {
    const empty: OrderFilter = {};
    setFilter(empty);
    onApply(empty);
    onOpenChange(false);
  }

  function handleApply() {
    onApply(filter);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Filtros — Pedidos</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Cliente (busca por texto)</Label>
            <Input
              value={filter.customerName ?? ""}
              onChange={(e) => setFilter((f) => ({ ...f, customerName: e.target.value || undefined }))}
              placeholder="Digite nome do cliente"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Data de retirada (de)</Label>
              <Input
                type="date"
                value={filter.pickupFrom ? filter.pickupFrom.slice(0, 10) : ""}
                onChange={(e) => setFilter((f) => ({ ...f, pickupFrom: e.target.value ? e.target.value : undefined }))}
              />
            </div>
            <div>
              <Label>Data de retirada (até)</Label>
              <Input
                type="date"
                value={filter.pickupTo ? filter.pickupTo.slice(0, 10) : ""}
                onChange={(e) => setFilter((f) => ({ ...f, pickupTo: e.target.value ? e.target.value : undefined }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Data de criação (de)</Label>
              <Input
                type="date"
                value={filter.createdFrom ? filter.createdFrom.slice(0, 10) : ""}
                onChange={(e) => setFilter((f) => ({ ...f, createdFrom: e.target.value ? e.target.value : undefined }))}
              />
            </div>
            <div>
              <Label>Data de criação (até)</Label>
              <Input
                type="date"
                value={filter.createdTo ? filter.createdTo.slice(0, 10) : ""}
                onChange={(e) => setFilter((f) => ({ ...f, createdTo: e.target.value ? e.target.value : undefined }))}
              />
            </div>
          </div>

          <div>
            <Label>Funcionário (criador do pedido)</Label>
            <select
              value={filter.createdBy ?? ""}
              onChange={(e) => setFilter((f) => ({ ...f, createdBy: e.target.value || undefined }))}
              className="w-full border rounded px-2 py-1 mt-1"
            >
              <option value="">— qualquer —</option>
              {creators.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <DialogFooter className="mt-4 flex gap-2 justify-end">
          <Button variant="ghost" onClick={() => { onOpenChange(false); setFilter(initial ?? {}); }}>
            Fechar
          </Button>
          <Button variant="secondary" onClick={handleClear}>
            Limpar
          </Button>
          <Button onClick={handleApply}>Aplicar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
