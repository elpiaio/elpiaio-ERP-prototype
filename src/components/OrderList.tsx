// src/Components/OrderList.tsx
"use client";
import React, { useEffect, useRef } from "react";
import { useOrderStore } from "@/Store/orderStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const OrderList: React.FC = () => {
  const orders = useOrderStore((s) => s.orders);
  const loading = useOrderStore((s) => s.loading);
  const fetchOrders = useOrderStore((s) => s.fetchOrders);
  const clearMock = useOrderStore((s) => s.clearMock);

  const fetchRef = useRef(fetchOrders);
  useEffect(() => {
    fetchRef.current();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Pedidos</h2>
        <div className="flex gap-2">
          <Button onClick={() => fetchOrders()}>Recarregar</Button>
          <Button variant="destructive" onClick={() => { if (!confirm("Apagar mock?")) return; clearMock().then(() => fetchOrders()); }}>
            Reset Mock
          </Button>
        </div>
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : orders.length === 0 ? (
        <p>Nenhum pedido</p>
      ) : (
        <div className="grid gap-3">
          {orders.map((o) => (
            <Card key={o.id} className="p-4 flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <div className="text-lg font-semibold">{o.customerName}</div>
                  <div className="text-sm text-slate-500">{new Date(o.createdAt).toLocaleString()}</div>
                </div>

                <div className="mt-2 text-sm">
                  {o.items.map((it) => (
                    <div key={it.productId} className="flex gap-4">
                      <div className="w-56">{it.productName}</div>
                      <div>{it.quantity} x R${it.price.toFixed(2)}</div>
                      <div className="font-semibold">R${it.total.toFixed(2)}</div>
                    </div>
                  ))}
                </div>



              </div>

              <div className="text-right">
                <div className="text-lg font-bold">R${o.total.toFixed(2)}</div>
                <div className="mt-2">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs ${o.status === "pendente" ? "bg-yellow-100 text-yellow-800" :
                      o.status === "concluido" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    }`}>{o.status}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
