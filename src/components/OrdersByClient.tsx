// src/Components/OrdersByClient.tsx
"use client";
import React, { useEffect } from "react";
import { useOrderStore } from "@/Store/orderStore";
import OrderEditCard from "./OrderEditCard";

export default function OrdersByClient() {
  const orders = useOrderStore((s) => s.orders);
  const fetchOrders = useOrderStore((s) => s.fetchOrders);

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const groups = orders.reduce<Record<string, typeof orders>>((acc, o) => {
    const key = o.customerName ?? "Sem cliente";
    acc[key] = acc[key] ?? [];
    acc[key].push(o);
    return acc;
  }, {});

  const sortedKeys = Object.keys(groups).sort((a, b) => a.localeCompare(b));

  return (
    <div className="space-y-6">
      {sortedKeys.map((key) => (
        <section key={key}>
          <h3 className="text-lg font-semibold mb-3">{key}</h3>
          <div className="space-y-3">
            {groups[key].map((o) => (
              <OrderEditCard key={o.id} order={o} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
