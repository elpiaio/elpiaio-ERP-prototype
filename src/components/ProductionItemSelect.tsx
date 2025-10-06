// src/Components/ProductionItemSelect.tsx
"use client";
import React, { useEffect, useMemo, useState } from "react";
import { ProductionItem } from "@/Types/production";
import { productionService } from "@/Services/productionService";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Props = {
  onSelect: (item: ProductionItem) => void;
  placeholder?: string;
  className?: string;
};

export default function ProductionItemSelect({ onSelect, placeholder, className }: Props) {
  const [all, setAll] = useState<ProductionItem[]>([]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    productionService.getAll().then(setAll).catch(() => setAll([]));
  }, []);

  const results = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return all.slice(0, 10);
    return all.filter((p) => p.name.toLowerCase().includes(qq) || (p.subcategory ?? "").toLowerCase().includes(qq)).slice(0, 20);
  }, [all, q]);

  return (
    <div className={`relative ${className ?? ""}`}>
      <Input
        placeholder={placeholder ?? "Buscar item de produção..."}
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
      />

      {open && (
        <Card className="absolute z-50 mt-2 w-full max-h-64 overflow-auto p-1">
          <div className="space-y-1">
            {results.map((r) => (
              <button
                key={r.id}
                onClick={() => { onSelect(r); setOpen(false); setQ(""); }}
                className="w-full text-left px-3 py-2 rounded hover:bg-slate-100 flex justify-between items-center"
              >
                <div>
                  <div className="font-medium">{r.name}</div>
                  <div className="text-xs text-slate-500">{r.category} · {r.subcategory ?? ""}</div>
                </div>
                <div className="text-sm font-semibold">{r.quantity} {r.unit}</div>
              </button>
            ))}
            {results.length === 0 && <div className="p-2 text-sm text-slate-500">Nenhum item encontrado</div>}
          </div>

          <div className="mt-2 px-2 flex justify-end">
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Fechar</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
