"use client";
import React, { useState } from "react";
import { useOrderStore } from "@/Store/orderStore";

export const OrderForm: React.FC = () => {
  const addOrder = useOrderStore((s) => s.addOrder);
  const [customerName, setCustomerName] = useState("");
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState<number>(1);
  const [price, setPrice] = useState<number>(0.0);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !productName || quantity <= 0 || price <= 0) return;

    setSubmitting(true);
    try {
      const item = {
        productId: `p_${Date.now()}`,
        productName,
        quantity,
        price,
        total: Number((quantity * price).toFixed(2)),
      };
      await addOrder({
        customerName,
        items: [item],
        total: item.total,
        status: "pendente",
      });
      // reset
      setCustomerName("");
      setProductName("");
      setQuantity(1);
      setPrice(0);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-4 border rounded-md">
      <div>
        <label className="block text-sm font-medium">Cliente</label>
        <input
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          className="mt-1 block w-full border rounded px-2 py-1"
          required
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-sm font-medium">Produto</label>
          <input
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="mt-1 block w-full border rounded px-2 py-1"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Quantidade</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="mt-1 block w-full border rounded px-2 py-1"
            min={1}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Preço (R$)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="mt-1 block w-full border rounded px-2 py-1"
            step="0.01"
            min="0"
            required
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-60"
          disabled={submitting}
        >
          {submitting ? "Adicionando..." : "Adicionar Pedido"}
        </button>
        <small className="text-sm text-muted-foreground">
          Valor total: R${(quantity * price).toFixed(2)}
        </small>
      </div>
    </form>
  );
};
