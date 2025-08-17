// src/Components/OrderForm.tsx
"use client";
import React, { useEffect, useState } from "react";
import { useOrderStore } from "@/Store/orderStore";
import ProductSelect from "./ProductSelect";
import { Product } from "@/Types/product";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { employeeService } from "@/Services/employeeService";

export const OrderForm: React.FC = () => {
  const addOrder = useOrderStore((s) => s.addOrder);
  const [customerName, setCustomerName] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);

  // pickup: datetime-local value (string like "2025-08-17T08:30")
  const [pickupLocal, setPickupLocal] = useState<string>(""); 
  // employees
  const [employees, setEmployees] = useState<{ id: string; name: string }[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | "">("");

  useEffect(() => {
    employeeService.getAll().then(setEmployees).catch(() => setEmployees([]));
  }, []);

  const price = selectedProduct?.price ?? 0;
  const total = Number((quantity * price).toFixed(2));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !selectedProduct || quantity <= 0 || price <= 0) return;

    setSubmitting(true);
    try {
      const pickupAtIso = pickupLocal ? new Date(pickupLocal).toISOString() : null;
      const emp = employees.find((x) => x.id === selectedEmployeeId);

      await addOrder({
        customerName,
        items: [
          {
            productId: selectedProduct.id,
            productName: selectedProduct.name,
            quantity,
            price,
            total,
            product: selectedProduct,
          },
        ],
        total,
        status: "pendente",
        pickupAt: pickupAtIso,
        createdById: emp?.id ?? null,
        createdByName: emp?.name ?? null,
      });

      // limpa
      setCustomerName("");
      setSelectedProduct(null);
      setQuantity(1);
      setPickupLocal("");
      setSelectedEmployeeId("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <h3 className="text-lg font-semibold">Novo Pedido</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Cliente</label>
          <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Nome do cliente" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Produto</label>
          <ProductSelect onSelect={(p) => setSelectedProduct(p)} placeholder="Digite para buscar produto..." />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-sm font-medium mb-1">Quantidade</label>
            <Input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value) || 1)} min={1} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Preço (R$)</label>
            <Input value={price.toFixed(2)} readOnly />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Total (R$)</label>
            <Input value={total.toFixed(2)} readOnly />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium mb-1">Data/Hora de Retirada</label>
            <Input
              type="datetime-local"
              value={pickupLocal}
              onChange={(e) => setPickupLocal(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Funcionário</label>
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="mt-1 block w-full border rounded px-2 py-1"
            >
              <option value="">— Selecionar —</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={submitting}>
            {submitting ? "Adicionando..." : "Adicionar Pedido"}
          </Button>
          <Button variant="secondary" type="button" onClick={() => { setSelectedProduct(null); setQuantity(1); setPickupLocal(""); setSelectedEmployeeId(""); }}>
            Limpar
          </Button>
        </div>
      </form>
    </Card>
  );
};
