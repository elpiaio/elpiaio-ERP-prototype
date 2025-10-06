// src/app/productions/page.tsx
import React from "react";
import ProductionTable from "@/components/ProductionTable";

export default function ProductionsPage() {
  return (
    <main className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Planejamento de Produção</h1>
      <ProductionTable />
    </main>
  );
}
