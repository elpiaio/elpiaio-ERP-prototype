// src/Types/production.ts
export type Breakdown = {
  level1Name: string;
  level1Count?: number;
  level2Name?: string;
  level2PerLevel1?: number;
  unitsPerLevel2?: number;
};

export type ProductionItem = {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  method?: "forno" | "fritura" | string;
  unit: string; // e.g., "unidades", "armários"
  quantity: number;
  breakdown?: Breakdown | null;

  // NOVOS CAMPOS FINANCEIROS (por unidade)
  cost: number;    // custo por unidade (R$)
  price: number;   // preço de venda por unidade (R$)
};
