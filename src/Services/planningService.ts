// src/Services/planningService.ts
import { ProductionItem } from "@/Types/production";
import { ProductionPlan, ProductionPlanItem } from "@/Types/planning";
import { productionService } from "@/Services/productionService";

const STORAGE_KEY = "production_plans_v1";

/** helper => normalize date to YYYY-MM-DD */
function dateKey(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  const iso = d.toISOString();
  return iso.slice(0, 10);
}

/** read all plans from localStorage */
function readAll(): ProductionPlan[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as ProductionPlan[];
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}
function writeAll(plans: ProductionPlan[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
}

export const planningService = {
  /** get plan by date (YYYY-MM-DD) */
  async getPlanByDate(date: Date | string): Promise<ProductionPlan | null> {
    const key = dateKey(date);
    const plans = readAll();
    const item = plans.find((p) => p.date === key) ?? null;
    return item;
  },

  /** save or replace plan for date */
  async savePlan(plan: ProductionPlan): Promise<void> {
    const key = plan.date;
    const all = readAll();
    const idx = all.findIndex((p) => p.date === key);
    const now = new Date().toISOString();
    const toSave = { ...plan, updatedAt: now };
    if (idx === -1) {
      const created = { ...toSave, createdAt: now };
      all.push(created);
    } else {
      all[idx] = { ...all[idx], ...toSave };
    }
    writeAll(all);
    // small latency
    await new Promise((r) => setTimeout(r, 80));
  },

  /** delete plan for date */
  async deletePlanForDate(date: Date | string): Promise<void> {
    const key = dateKey(date);
    const all = readAll().filter((p) => p.date !== key);
    writeAll(all);
    await new Promise((r) => setTimeout(r, 40));
  },

  /**
   * If there's no saved plan for the date, create a default plan for that weekday.
   * For now the default is the production.json items with their declared quantity (you can customize per weekday later).
   */
  async getOrCreateDefaultPlanForDate(date: Date | string): Promise<ProductionPlan> {
    const key = dateKey(date);
    const existing = await this.getPlanByDate(key);
    if (existing) return existing;

    // build default from production items
    const baseItems = await productionService.getAll(); // ProductionItem[]
    // map to ProductionPlanItem (we copy quantity from base item)
    const planItems: ProductionPlanItem[] = baseItems.map((it) => ({
      ...it,
      quantity: it.quantity,
    }));

    const now = new Date().toISOString();
    const plan: ProductionPlan = {
      date: key,
      items: planItems,
      createdAt: now,
      updatedAt: now,
    };

    // not saving automatically, return default but if user saves it will persist
    return plan;
  },

  /** returns list of saved plans (for history view later) */
  async listPlans(): Promise<ProductionPlan[]> {
    return readAll();
  },
};
