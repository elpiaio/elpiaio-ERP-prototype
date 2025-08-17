"use client";

import React from "react";
import { OrderForm } from "@/components/OrderForm";
import { OrderList } from "@/components/OrderList";

export default function NewOrderPage() {
  return (
    <main className="p-6 max-w-6xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Novo Pedido</h1>
        <p className="text-sm text-slate-600 mt-1">
          Preencha os dados do pedido, selecione produtos e defina a data/hora de retirada.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário de criação — ocupa 1 coluna em lg */}
        <section className="lg:col-span-1">
          <OrderForm />
        </section>

        {/* Lista de pedidos — ocupa 2 colunas em lg */}
        <section className="lg:col-span-2">
          <OrderList />
        </section>
      </div>
    </main>
  );
}