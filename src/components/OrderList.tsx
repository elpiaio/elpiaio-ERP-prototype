// src/Components/OrderList.tsx
"use client";
import React, { useEffect, useRef } from "react";
import { useOrderStore } from "@/Store/orderStore";

export const OrderList: React.FC = () => {
  // Seletores individuais — evita problemas de inferência de tipo
  const orders = useOrderStore((state) => state.orders);
  const loading = useOrderStore((state) => state.loading);
  const fetchOrders = useOrderStore((state) => state.fetchOrders);
  const clearMock = useOrderStore((state) => state.clearMock);

  // Guardamos a referência da função para chamar apenas no mount (evita loops)
  const fetchRef = useRef(fetchOrders);
  useEffect(() => {
    fetchRef.current();
    // Intencional: não colocamos fetchOrders nas deps para evitar re-execução por identidade
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Pedidos</h2>
        <div className="flex gap-2">
          <button
            className="px-3 py-1 border rounded text-sm"
            onClick={() => fetchOrders()}
          >
            Recarregar
          </button>
          <button
            className="px-3 py-1 border rounded text-sm text-red-600"
            onClick={() => {
              if (!confirm("Apagar mock local e recarregar?")) return;
              clearMock().then(() => fetchOrders());
            }}
          >
            Reset Mock
          </button>
        </div>
      </div>

      {loading ? (
        <p>Carregando pedidos...</p>
      ) : orders.length === 0 ? (
        <p>Nenhum pedido</p>
      ) : (
        <ul className="space-y-2">
          {orders.map((o) => (
            <li
              key={o.id}
              className="border rounded p-3 flex justify-between items-start"
            >
              <div>
                <div className="font-semibold">{o.customerName}</div>
                <div className="text-sm text-slate-600">
                  {new Date(o.createdAt).toLocaleString()}
                </div>
                <div className="mt-2">
                  {o.items.map((it) => (
                    <div key={it.productId} className="text-sm">
                      {it.productName} — {it.quantity} x R${it.price} = R${it.total}
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold">R${o.total.toFixed(2)}</div>
                <div className="text-sm mt-1">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs ${
                      o.status === "pendente"
                        ? "bg-yellow-100 text-yellow-800"
                        : o.status === "concluido"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {o.status}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
