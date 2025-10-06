// src/Components/OrderCreator.tsx
"use client";

import React, { useEffect, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Product } from "@/Types/product";
import { Order } from "@/Types/order";
import { productService } from "@/Services/productService";
import { employeeService } from "@/Services/employeeService";
import { useOrderStore } from "@/Store/orderStore";

import ProductSelect from "../ProductSelect";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

type FormItem = {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
};

type FormValues = {
  customerName: string;
  items: FormItem[];
  pickupAt?: string;
  createdById?: string;
  note?: string;
  discount?: number;
};

export default function OrderCreator() {
  const addOrder = useOrderStore((s) => s.addOrder);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    getValues,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      customerName: "",
      items: [],
      pickupAt: "",
      createdById: "",
      note: "",
      discount: 0,
    },
  });

  const { fields, append, remove } = useFieldArray<FormValues, "items">({
    control,
    name: "items",
  });

  const [products, setProducts] = React.useState<Product[]>([]);
  const [employees, setEmployees] = React.useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    productService.getAll().then(setProducts).catch(() => setProducts([]));
    employeeService.getAll().then(setEmployees).catch(() => setEmployees([]));
  }, []);

  const productsMap = useMemo(() => {
    const m = new Map<string, Product>();
    products.forEach((p) => m.set(p.id, p));
    return m;
  }, [products]);

  const watchedItems = watch("items") ?? [];
  const watchedDiscount = Number(watch("discount") ?? 0);

  // append product when selected from ProductSelect
  const handleAddProduct = (p: Product) => {
    const existingIndex = getValues("items")?.findIndex((it) => it.productId === p.id);
    if (typeof existingIndex === "number" && existingIndex >= 0) {
      // if already in items, increment quantity
      const currentQty = Number(getValues(`items.${existingIndex}.quantity`) ?? 1);
      setValue(`items.${existingIndex}.quantity`, currentQty + 1, { shouldDirty: true });
      const price = Number(getValues(`items.${existingIndex}.price`) ?? p.price);
      setValue(`items.${existingIndex}.total`, Number(((currentQty + 1) * price).toFixed(2)), { shouldDirty: true });
      return;
    }

    append({
      productId: p.id,
      productName: p.name,
      quantity: 1,
      price: p.price,
      total: Number(p.price.toFixed(2)),
    });
  };

  // ensure totals sync when quantity or price change (we update totals imperatively)
  useEffect(() => {
    watchedItems.forEach((it, idx) => {
      const q = Number(it?.quantity ?? 0);
      const p = Number(it?.price ?? 0);
      const newTotal = Number((q * p).toFixed(2));
      if (Number(it?.total ?? 0) !== newTotal) {
        setValue(`items.${idx}.total`, newTotal, { shouldDirty: true });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedItems]);

  const subtotal = watchedItems.reduce((s, it) => s + (Number(it?.total ?? 0)), 0);
  const total = Number((subtotal - (watchedDiscount || 0)).toFixed(2));

  const onSubmit = async (data: FormValues) => {
    if (!data.customerName || !data.items?.length) {
      alert("Preencha cliente e adicione pelo menos um item.");
      return;
    }

    const pickupIso = data.pickupAt ? new Date(data.pickupAt).toISOString() : null;
    const emp = employees.find((e) => e.id === data.createdById) ?? null;

    const newOrder: Partial<Omit<Order, "id" | "createdAt">> & {
      customerName: string;
      items: Order["items"];
      total: number;
      pickupAt?: string | null;
      createdById?: string | null;
      createdByName?: string | null;
    } = {
      customerName: data.customerName,
      items: data.items.map((it) => ({
        productId: it.productId,
        productName: it.productName,
        quantity: it.quantity,
        price: it.price,
        total: it.total,
      })),
      total,
      pickupAt: pickupIso,
      createdById: emp?.id ?? null,
      createdByName: emp?.name ?? null,
      status: "pendente",
    };

    try {
      // eslint-disable-next-line
      await addOrder(newOrder as any);
      reset();
    } catch (err) {
      console.error(err);
      alert("Erro ao criar pedido");
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <h3 className="text-lg font-semibold">Criar novo pedido</h3>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label>Cliente</Label>
          <Input {...register("customerName", { required: true })} placeholder="Nome do cliente" />
        </div>

        <div>
          <Label>Buscar produto</Label>
          <div className="mt-2 flex gap-2 items-start">
            <div className="flex-1 min-w-0">
              <ProductSelect onSelect={handleAddProduct} placeholder="Digite para buscar produto..." />
            </div>
            <div className="hidden sm:block">
              <div className="text-xs text-slate-500">Dicas:</div>
              <div className="text-xs text-slate-500">Clique no produto para adicionar</div>
            </div>
          </div>
        </div>

        {/* items */}
        <div>
          <Label>Itens</Label>
          <div className="mt-3 space-y-2">
            {fields.length === 0 && (
              <p className="text-sm text-slate-500">Nenhum item. Use a busca para adicionar produtos.</p>
            )}

            {fields.map((f, idx) => {
              const prod = productsMap.get(f.productId);
              // watch values for display
              const qty = Number(watch(`items.${idx}.quantity`) ?? f.quantity);
              const price = Number(watch(`items.${idx}.price`) ?? f.price);
              const itemTotal = Number(watch(`items.${idx}.total`) ?? f.total);

              return (
                <div key={f.id} className="flex flex-col sm:flex-row sm:items-center gap-3 border rounded p-3 bg-white">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-medium truncate">{f.productName}</div>
                      <div className="text-sm text-slate-500 hidden sm:block">R${price.toFixed(2)}</div>
                    </div>
                    <div className="text-xs text-slate-500 mt-1 truncate">{prod?.category ?? ""}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-24">
                      <Label className="text-xs">Qtd</Label>
                      <Input
                        type="number"
                        defaultValue={f.quantity}
                        {...register(`items.${idx}.quantity` as const, {
                          valueAsNumber: true,
                          onChange: (e) => {
                            const q = Number((e.target as HTMLInputElement).value) || 1;
                            const p = Number(getValues(`items.${idx}.price`) ?? price);
                            setValue(`items.${idx}.quantity`, q, { shouldDirty: true });
                            setValue(`items.${idx}.total`, Number((q * p).toFixed(2)), { shouldDirty: true });
                          },
                        })}
                      />
                    </div>

                    <div className="w-28 hidden sm:block">
                      <Label className="text-xs">Preço</Label>
                      <Input
                        type="number"
                        step="0.01"
                        defaultValue={f.price}
                        {...register(`items.${idx}.price` as const, {
                          valueAsNumber: true,
                          onChange: (e) => {
                            const p = Number((e.target as HTMLInputElement).value) || 0;
                            const q = Number(getValues(`items.${idx}.quantity`) ?? qty) || 1;
                            setValue(`items.${idx}.price`, p, { shouldDirty: true });
                            setValue(`items.${idx}.total`, Number((q * p).toFixed(2)), { shouldDirty: true });
                          },
                        })}
                      />
                    </div>

                    <div className="w-28">
                      <Label className="text-xs">Total</Label>
                      <Input value={itemTotal.toFixed(2)} readOnly />
                    </div>

                    <div>
                      <Button variant="destructive" onClick={() => remove(idx)}>Remover</Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* extras */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <Label>Data / Hora de Retirada</Label>
            <Input type="datetime-local" {...register("pickupAt")} />
          </div>

          {/*
          <div>
            <Label>Funcionário (criador)</Label>
            <select {...register("createdById")} className="mt-1 block w-full border rounded px-2 py-1">
              <option value="">— Selecionar —</option>
              {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
          */}

          <div>
            <Label>Desconto (R$)</Label>
            <Input type="number" step="0.01" {...register("discount", { valueAsNumber: true })} />
          </div>

          <div>
            <Label>Observação</Label>
            <Input {...register("note")} />
          </div>
        </div>

        {/* summary */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm text-slate-600">Subtotal: R${subtotal.toFixed(2)}</div>
            <div className="text-sm text-slate-600">Desconto: R${Number(watchedDiscount).toFixed(2)}</div>
            <div className="text-lg font-bold">Total: R${total.toFixed(2)}</div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Salvando..." : "Criar Pedido"}</Button>
            <Button variant="secondary" type="button" onClick={() => reset()}>Limpar</Button>
          </div>
        </div>
      </form>
    </Card>
  );
}
