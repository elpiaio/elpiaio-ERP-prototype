// src/Components/OrdersByDate.tsx
"use client";
import React, { useEffect } from "react";
import { useOrderStore } from "@/Store/orderStore";
import OrderEditCard from "./OrderEditCard";

function formatDateKey(iso?: string) {
  if (!iso) return "Sem data";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "Sem data";
  return d.toLocaleDateString();
}

export default function OrdersByDate() {
  const orders = useOrderStore((s) => s.orders);
  const fetchOrders = useOrderStore((s) => s.fetchOrders);

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const groups = orders.reduce<Record<string, typeof orders>>((acc, o) => {
    const key = formatDateKey(o.createdAt);
    acc[key] = acc[key] ?? [];
    acc[key].push(o);
    return acc;
  }, {});

  const sortedKeys = Object.keys(groups).sort((a, b) => {
    // sort descending by date (try parse)
    const da = new Date(groups[a][0].createdAt).getTime();
    const db = new Date(groups[b][0].createdAt).getTime();
    return db - da;
  });

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
