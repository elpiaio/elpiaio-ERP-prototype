// src/Services/productionService.ts
import { fetchJson } from "@/Libs/api";
import { ProductionItem } from "@/Types/production";

export const productionService = {
  async getAll(): Promise<ProductionItem[]> {
    return fetchJson<{ items: ProductionItem[] }>("/mock/production.json").then((r) => r.items);
  },
};
