// src/app/pedidos/novo/page.tsx
import React from "react";
import OrderCreator from "@/components/OrderCreator/OrderCreator";

export const metadata = {
  title: "Novo Pedido",
};

export default function NewOrderPage() {
  return (
    <main className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Criar Pedido</h1>
      <OrderCreator />
    </main>
  );
}
