// src/Components/OrdersByDate.tsx
"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useOrderStore } from "@/Store/orderStore";
import OrderEditCard from "./OrderEditCard";
import FilterModal from "./FilterModal";
import { matchesFilter } from "@/Libs/filterUtils";
import { OrderFilter } from "@/Types/filter";
import { Button } from "@/components/ui/button";

function formatDateKey(iso?: string) {
  if (!iso) return "Sem data";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "Sem data";
  return d.toLocaleDateString();
}

export default function OrdersByDate() {
  const orders = useOrderStore((s) => s.orders);
  const fetchOrders = useOrderStore((s) => s.fetchOrders);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filter, setFilter] = useState<OrderFilter | undefined>(undefined);

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    return orders.filter((o) => matchesFilter(o, filter));
  }, [orders, filter]);

  const groups = useMemo(() => {
    return filtered.reduce<Record<string, typeof filtered>>((acc, o) => {
      const key = formatDateKey(o.createdAt);
      acc[key] = acc[key] ?? [];
      acc[key].push(o);
      return acc;
    }, {});
  }, [filtered]);

  const sortedKeys = useMemo(() => {
    return Object.keys(groups).sort((a, b) => {
      const da = new Date(groups[a][0].createdAt).getTime();
      const db = new Date(groups[b][0].createdAt).getTime();
      return db - da;
    });
  }, [groups]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Pedidos (por data)</h2>
        <div className="flex gap-2">
          <Button onClick={() => setFilterOpen(true)}>Filtrar</Button>
          <Button variant="ghost" onClick={() => setFilter(undefined)}>Limpar filtros</Button>
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
