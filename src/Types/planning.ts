// src/Types/planning.ts
import { ProductionItem } from "./production";

export type ProductionPlanItem = ProductionItem & {
  // quantity is editable in the plan (can override base quantity)
  quantity: number;
};

export type ProductionPlan = {
  // date in YYYY-MM-DD (date-only key)
  date: string;
  items: ProductionPlanItem[];
  createdAt: string; // ISO
  updatedAt?: string; // ISO
};
