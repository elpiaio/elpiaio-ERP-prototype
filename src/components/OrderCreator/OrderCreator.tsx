// src/Components/OrderCreator/OrderCreator.tsx
"use client";

import React, { useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import ProductSelect from "@/components/ProductSelect";
import { Product } from "@/Types/product";
import { Order, OrderItem } from "@/Types/order";
import { useOrderStore } from "@/Store/orderStore";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";

const ItemSchema = z.object({
  productId: z.string().min(1),
  productName: z.string().min(1),
  quantity: z.number().min(1),
  price: z.number().min(0.01),
  total: z.number().min(0.01),
});

const CreateOrderSchema = z.object({
  customerName: z.string().min(1, "Nome do cliente é obrigatório"),
  items: z.array(ItemSchema).min(1, "Adicione ao menos 1 item"),
  discount: z.number().min(0).optional(),
  note: z.string().optional(),
});

type CreateOrderForm = z.infer<typeof CreateOrderSchema>;
type NewOrder = Omit<Order, "id" | "createdAt">;

export default function OrderCreator() {
  const router = useRouter();
  const addOrder = useOrderStore((s) => s.addOrder);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
    getValues,
  } = useForm<CreateOrderForm>({
    resolver: zodResolver(CreateOrderSchema),
    defaultValues: { customerName: "", items: [], discount: 0, note: "" },
  });

  const { fields, append, remove, update } = useFieldArray({
    name: "items",
    control,
  });

  // watch fields for totals
  const items = watch("items") ?? [];
  const discount = watch("discount") ?? 0;

  const subtotal = useMemo(() => {
    return items.reduce((s, it) => s + (it?.total ?? 0), 0);
  }, [items]);

  const total = useMemo(() => {
    const d = Number(discount) || 0;
    return Number(Math.max(0, subtotal - d).toFixed(2));
  }, [subtotal, discount]);

  // append new item when product selected
  function onProductSelect(product: Product) {
    const item: OrderItem = {
      productId: product.id,
      productName: product.name,
      quantity: 1,
      price: product.price,
      total: Number(product.price.toFixed(2)),
      product,
    };
    append(item);
  }

  function updateQuantity(index: number, q: number) {
    const it = fields[index];
    if (!it) return;
    const price = getValues(`items.${index}.price`) as number ?? it.price ?? 0;
    const newTotal = Number((q * price).toFixed(2));
    update(index, { ...it, quantity: q, total: newTotal });
    // keep form values in sync
    setValue(`items.${index}.quantity`, q, { shouldTouch: true, shouldValidate: true });
    setValue(`items.${index}.total`, newTotal, { shouldTouch: false });
  }

  function removeItem(index: number) {
    remove(index);
  }

  async function onSubmit(data: CreateOrderForm) {
    const orderToSave: NewOrder = {
      customerName: data.customerName,
      items: data.items.map((it) => ({
        productId: it.productId,
        productName: it.productName,
        quantity: it.quantity,
        price: it.price,
        total: it.total,
      })),
      total,
      status: "pendente",
    };

    await addOrder(orderToSave);
    reset();
    router.push("/pedidos");
  }

  // For mobile sticky bottom button focus
  const bottomRef = useRef<HTMLDivElement | null>(null);

  return (
    <>
      <Card className="p-4 md:p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* LEFT: Customer + product search */}
            <div className="lg:col-span-2 space-y-3">
              <div>
                <Label>Cliente</Label>
                <Input
                  {...register("customerName")}
                  placeholder="Nome do cliente"
                  className="mt-1"
                />
                {errors.customerName && (
                  <p className="text-xs text-red-600 mt-1">{String(errors.customerName.message)}</p>
                )}
              </div>

              <div>
                <Label>Adicionar produto</Label>
                <div className="mt-1">
                  <ProductSelect onSelect={onProductSelect} placeholder="Digite e selecione..." />
                </div>
                <p className="text-xs text-slate-500 mt-1">Toque para selecionar — o item será adicionado ao pedido</p>
              </div>

              {/* Items list (compact) */}
              <div>
                <Label>Itens</Label>
                <div className="mt-3 space-y-2">
                  {fields.length === 0 && (
                    <p className="text-sm text-slate-500">Nenhum item. Use a busca para adicionar produtos.</p>
                  )}

                  {fields.map((f, idx) => (
                    <div
                      key={f.id}
                      className="flex flex-col sm:flex-row sm:items-center gap-3 border rounded p-3 bg-white"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-3">
                          <div className="font-medium truncate">{f.productName}</div>
                          <div className="text-sm text-slate-500 hidden sm:block">R${(f.price ?? 0).toFixed(2)}</div>
                        </div>
                        <div className="text-xs text-slate-500 mt-1 truncate">{f.productName}</div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="w-24">
                          <Label className="text-xs">Qtd</Label>
                          <Input
                            type="number"
                            min={1}
                            {...register(`items.${idx}.quantity`, {
                              valueAsNumber: true,
                              onChange: (e) => {
                                const q = Number(e.target.value || 0);
                                updateQuantity(idx, q > 0 ? q : 1);
                              },
                            })}
                            defaultValue={f.quantity}
                            className="mt-1"
                          />
                        </div>

                        <div className="w-28 hidden sm:block">
                          <Label className="text-xs">Preço</Label>
                          <Input {...register(`items.${idx}.price`, { valueAsNumber: true })} defaultValue={(f.price ?? 0).toFixed(2)} readOnly className="mt-1" />
                        </div>

                        <div className="w-28">
                          <Label className="text-xs">Total</Label>
                          <Input {...register(`items.${idx}.total`, { valueAsNumber: true })} defaultValue={(f.total ?? 0).toFixed(2)} readOnly className="mt-1" />
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          className="ml-1 text-red-600 hover:text-red-700 p-2 rounded-md"
                          aria-label={`Remover ${f.productName}`}
                          title="Remover item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Observações</Label>
                <Input {...register("note")} placeholder="Observações do pedido" className="mt-1" />
              </div>
            </div>

            {/* RIGHT: summary panel (desktop) */}
            <aside className="lg:col-span-1">
              <div className="sticky top-6">
                <div className="bg-white border rounded p-4 flex flex-col gap-3">
                  <div className="flex justify-between">
                    <div className="text-sm text-slate-600">Subtotal</div>
                    <div className="font-semibold">R${subtotal.toFixed(2)}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <Label className="text-xs">Desconto</Label>
                      <Input type="number" step="0.01" {...register("discount", { valueAsNumber: true })} className="mt-1" />
                    </div>
                  </div>

                  <div className="border-t pt-3 mt-2">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-slate-600">Total</div>
                      <div className="text-2xl font-bold">R${total.toFixed(2)}</div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button variant="ghost" onClick={() => reset()}>Limpar</Button>
                      <Button type="submit" disabled={isSubmitting} onClick={() => { /* submit handled by form */ }}>
                        {isSubmitting ? "Salvando..." : "Salvar Pedido"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </form>
      </Card>

      {/* MOBILE sticky bottom bar */}
      <div ref={bottomRef} className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-lg px-4 md:hidden">
        <div className="bg-white border rounded-lg p-3 flex items-center justify-between gap-3 shadow-lg">
          <div>
            <div className="text-xs text-slate-500">Total</div>
            <div className="font-bold text-lg">R${total.toFixed(2)}</div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => reset()} size="sm">Limpar</Button>
            <Button onClick={() => {
              // trigger submit programmatically
              const form = document.querySelector('form');
              if (form) (form as HTMLFormElement).requestSubmit();
            }}>
              Salvar
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
