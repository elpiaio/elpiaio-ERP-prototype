"use client";
// src/app/pedidos/edit/page.tsx

import React, { useState } from "react";
import OrdersByDate from "@/components/OrdersByDate";
import OrdersByClient from "@/components/OrdersByClient";
import { Button } from "@/components/ui/button";

export default function PedidosEditPage() {
  const [view, setView] = useState<"date" | "client">("date");

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Editar Pedidos</h1>
        <div className="flex gap-2">
          <Button variant={view === "date" ? "default" : "ghost"} onClick={() => setView("date")}>Por Data</Button>
          <Button variant={view === "client" ? "default" : "ghost"} onClick={() => setView("client")}>Por Cliente</Button>
        </div>
      </div>

      {view === "date" ? <OrdersByDate /> : <OrdersByClient />}
    </main>
  );
}
