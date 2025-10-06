// src/Components/ProductionRangeModal.tsx
"use client";
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onApply: (start: string, end: string) => void; // dates as YYYY-MM-DD
  initialStart?: string;
  initialEnd?: string;
};

export default function ProductionRangeModal({ open, onOpenChange, onApply, initialStart, initialEnd }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const [start, setStart] = useState<string>(initialStart ?? today);
  const [end, setEnd] = useState<string>(initialEnd ?? today);

  const handleApply = () => {
    if (new Date(start) > new Date(end)) {
      alert("A data inicial não pode ser posterior à data final.");
      return;
    }
    onApply(start, end);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Filtrar Ordens por intervalo</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Data inicial</label>
            <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="w-full border rounded px-2 py-1" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Data final</label>
            <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="w-full border rounded px-2 py-1" />
          </div>
        </div>

        <DialogFooter className="mt-4 flex gap-2 justify-end">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Fechar</Button>
          <Button onClick={handleApply}>Aplicar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
