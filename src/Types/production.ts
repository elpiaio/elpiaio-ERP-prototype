// src/Types/production.ts
export type Breakdown = {
  level1Name: string; // ex: "armário"
  level1Count?: number; // number of level1 (optional; sometimes equals quantity)
  level2Name?: string; // ex: "lata"
  level2PerLevel1?: number; // how many level2 per level1
  unitsPerLevel2?: number; // units inside each level2
};

export type ProductionItem = {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  method?: "forno" | "fritura" | string;
  unit: string; // displayed unit (e.g., "unidades", "armários")
  quantity: number; // the primary quantity as supplied (meaning depends on unit)
  breakdown?: Breakdown | null; // optional hierarchical breakdown
};
