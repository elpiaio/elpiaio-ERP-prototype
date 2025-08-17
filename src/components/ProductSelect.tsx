// src/Components/ProductSelect.tsx
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
    if (!q) return all.slice(0, 8);
    return all
      .filter((p) => p.name.toLowerCase().includes(q) || (p.sku ?? "").toLowerCase().includes(q))
      .slice(0, 8);
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
        placeholder={placeholder ?? "Pesquisar produto..."}
        className="w-full touch-auto"
      />

      {open && (
        <Card className="absolute z-50 mt-2 w-full max-h-64 overflow-auto p-1 shadow-lg">
          <div className="space-y-1">
            {results.length === 0 ? (
              <div className="p-3 text-sm text-slate-500">Nenhum produto encontrado</div>
            ) : (
              results.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    onSelect(p);
                    setQuery("");
                    setOpen(false);
                  }}
                  className="w-full text-left px-3 py-3 rounded hover:bg-slate-50 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="font-medium truncate">{p.name}</div>
                    <div className="text-xs text-slate-500 truncate">{p.category ?? ""} {p.sku ? `· ${p.sku}` : ""}</div>
                  </div>
                  <div className="text-sm font-semibold">R${p.price.toFixed(2)}</div>
                </button>
              ))
            )}
          </div>

          <div className="mt-2 px-2 flex justify-end">
            <Button variant="ghost" size="sm" onClick={() => { setQuery(""); setOpen(false); }}>
              Fechar
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
