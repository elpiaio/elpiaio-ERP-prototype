import React from "react";
import { OrderForm } from "@/components/OrderForm";
import { OrderList } from "@/components/OrderList";

export default function PedidosPage() {
  return (
    <main className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Adicionar Pedidos — Protótipo</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section>
          <OrderForm />
        </section>

        <aside>
          <OrderList />
        </aside>
      </div>
    </main>
  );
}
