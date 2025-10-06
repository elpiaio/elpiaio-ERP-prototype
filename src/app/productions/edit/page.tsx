// src/app/productions/edit/page.tsx
import React from "react";
import ProductionEditTable from "@/components/ProductionEditTable";

export default function ProductionEditPage() {
  return (
    <main className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Editar Planejamento de Produção</h1>
      <p className="mb-4 text-sm text-slate-600">
        Escolha a data da ordem de produção, edite quantidades, adicione ou remova itens. Salve quando terminar.
      </p>

      <ProductionEditTable />
    </main>
  );
}
