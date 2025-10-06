import React from "react";
import OrderCreator from "@/components/OrderCreator/OrderCreator";

export default function NewOrderPage() {
  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Novo Pedido</h1>
      <OrderCreator />
    </main>
  );
}
