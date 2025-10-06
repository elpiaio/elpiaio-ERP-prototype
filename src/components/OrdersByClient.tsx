// src/Components/OrdersByClient.tsx
"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useOrderStore } from "@/Store/orderStore";
import OrderEditCard from "./OrderEditCard";
import FilterModal from "./FilterModal";
import { matchesFilter } from "@/Libs/filterUtils";
import { OrderFilter } from "@/Types/filter";
import { Button } from "@/components/ui/button";
import { Eraser, ListFilter } from "lucide-react";

export default function OrdersByClient() {
  const orders = useOrderStore((s) => s.orders);
  const fetchOrders = useOrderStore((s) => s.fetchOrders);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filter, setFilter] = useState<OrderFilter | undefined>(undefined);

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => orders.filter((o) => matchesFilter(o, filter)), [orders, filter]);

  const groups = useMemo(() => {
    return filtered.reduce<Record<string, typeof filtered>>((acc, o) => {
      const key = o.customerName ?? "Sem cliente";
      acc[key] = acc[key] ?? [];
      acc[key].push(o);
      return acc;
    }, {});
  }, [filtered]);

  const sortedKeys = useMemo(() => Object.keys(groups).sort((a, b) => a.localeCompare(b)), [groups]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Pedidos (por cliente)</h2>
        <div className="flex gap-2">
          <Button className={"cursor-pointer"} onClick={() => setFilterOpen(true)}><ListFilter /></Button>
          <Button className={"cursor-pointer"} variant="destructive" onClick={() => setFilter(undefined)}><Eraser /></Button>
        </div>
      </div>

      <FilterModal
        open={filterOpen}
        onOpenChange={setFilterOpen}
        initial={filter}
        onApply={(f) => setFilter(f)}
      />

      {sortedKeys.length === 0 ? (
        <p>Nenhum pedido encontrado</p>
      ) : (
        sortedKeys.map((key) => (
          <section key={key}>
            <h3 className="text-lg font-semibold mb-3">{key}</h3>
            <div className="space-y-3">
              {groups[key].map((o) => (
                <OrderEditCard key={o.id} order={o} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
