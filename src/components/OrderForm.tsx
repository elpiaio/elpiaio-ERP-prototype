// src/Components/OrderForm.tsx
"use client";
import React, { useState } from "react";
import { useOrderStore } from "@/Store/orderStore";
import ProductSelect from "./ProductSelect";
import { Product } from "@/Types/product";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const OrderForm: React.FC = () => {
  const addOrder = useOrderStore((s) => s.addOrder);
  const [customerName, setCustomerName] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);
  const [pickupLocal, setPickupLocal] = useState<string>(""); // value for <input type="datetime-local">
  const [note, setNote] = useState<string>("");

  const price = selectedProduct?.price ?? 0;
  const total = Number((quantity * price).toFixed(2));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !selectedProduct || quantity <= 0 || price <= 0) return;

    setSubmitting(true);
    try {
      // convert datetime-local (if provided) to ISO before sending
      let pickupIso: string | null = null;
      if (pickupLocal) {
        const d = new Date(pickupLocal);
        if (!isNaN(d.getTime())) pickupIso = d.toISOString();
      }

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
        pickupAt: pickupIso,
        note: note || undefined,
      });

      // limpa campos
      setCustomerName("");
      setSelectedProduct(null);
      setQuantity(1);
      setPickupLocal("");
      setNote("");
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
            <Input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} min={1} />
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

        <div>
          <label className="block text-sm font-medium mb-1">Horário aproximado de retirada</label>
          <input
            type="datetime-local"
            value={pickupLocal}
            onChange={(e) => setPickupLocal(e.target.value)}
            className="w-full border rounded px-2 py-1"
            placeholder="Selecione data e hora"
          />
          <p className="text-xs text-slate-500 mt-1">O cliente informa quando pretende buscar o pedido na padaria.</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Observações (opcional)</label>
          <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ex: entrega separada, sem glúten..." />
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={submitting}>
            {submitting ? "Adicionando..." : "Adicionar Pedido"}
          </Button>
          <Button variant="secondary" type="button" onClick={() => { setSelectedProduct(null); setQuantity(1); setPickupLocal(""); setNote(""); }}>
            Limpar
          </Button>
        </div>
      </form>
    </Card>
  );
};
