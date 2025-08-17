"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Product } from "@/Types/product";
import { productService } from "@/Services/productService";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Props = {
  onSelect: (product: Product) => void;
  className?: string;
  placeholder?: string;
};

export default function ProductSelect({ onSelect, className, placeholder }: Props) {
  const [all, setAll] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    productService.getAll().then(setAll).catch(() => setAll([]));
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return all.slice(0, 10);
    return all
      .filter((p) => p.name.toLowerCase().includes(q) || (p.sku ?? "").toLowerCase().includes(q))
      .slice(0, 10);
  }, [all, query]);

  return (
    <div className={`relative ${className ?? ""}`}>
      <Input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder ?? "Pesquise um produto..."}
        className="w-full"
      />

      {open && results.length > 0 && (
        <Card className="absolute z-50 mt-2 w-full max-h-60 overflow-auto p-1">
          <div className="space-y-1">
            {results.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  onSelect(p);
                  setQuery(`${p.name} — R$${p.price.toFixed(2)}`);
                  setOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded hover:bg-slate-100 flex justify-between items-center"
              >
                <div>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-slate-500">{p.category ?? ""} {p.sku ? `· ${p.sku}` : ""}</div>
                </div>
                <div className="text-sm font-semibold">R${p.price.toFixed(2)}</div>
              </button>
            ))}
          </div>

          <div className="mt-2 px-2">
            <Button variant="ghost" size="sm" onClick={() => { setQuery(""); setOpen(false); }}>
              Fechar
            </Button>
          </div>
        </Card>
      )}

      {open && results.length === 0 && (
        <Card className="absolute z-50 mt-2 w-full p-3">
          <div className="text-sm text-muted-foreground">Nenhum produto encontrado</div>
        </Card>
      )}
    </div>
  );
}
