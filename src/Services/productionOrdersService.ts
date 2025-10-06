// src/Services/productionOrdersService.ts
import { fetchJson } from "@/Libs/api";
import { ProductionItem } from "@/Types/production";
import { planningService } from "@/Services/planningService";
import { productionService } from "@/Services/productionService";

function toDDMMYYYY(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}
function toYYYYMMDD(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().slice(0, 10);
}
function weekdayKey(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const map = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  return map[d.getDay()];
}

type ProductionsOrdersFile = {
  defaultPlanning: Record<string, ProductionItem[]>;
  personalizedPlanning: Array<{ day: string; items: ProductionItem[] }>;
};

export type PlanWithSource = {
  dateKey: string; // YYYY-MM-DD
  items: ProductionItem[];
  source: "saved" | "personalized" | "default" | "fallback";
};

export const productionOrdersService = {
  async loadMockFile(): Promise<ProductionsOrdersFile> {
    return fetchJson<ProductionsOrdersFile>("/mock/productionsOrders.json");
  },

  /**
   * Prioridade:
   * 1) saved (planningService.getPlanByDate) -> source = "saved"
   * 2) personalized in mock -> source = "personalized"
   * 3) default by weekday -> source = "default"
   * 4) fallback to productionService.getAll() -> source = "fallback"
   */
  async getPlanForDate(date: Date | string): Promise<PlanWithSource> {
    const dateKey = toYYYYMMDD(date);

    // 1) saved plan
    const saved = await planningService.getPlanByDate(dateKey);
    if (saved) {
      return {
        dateKey,
        items: saved.items.map((it) => ({ ...it })),
        source: "saved",
      };
    }

    // 2) mock
    const mock = await this.loadMockFile();
    const ddmmyyyy = toDDMMYYYY(date);
    const personalized = mock.personalizedPlanning?.find((p) => p.day === ddmmyyyy);
    if (personalized) {
      return { dateKey, items: personalized.items, source: "personalized" };
    }

    // 3) default by weekday
    const wk = weekdayKey(date);
    const defaults = mock.defaultPlanning?.[wk] ?? [];
    if (defaults && defaults.length > 0) {
      return { dateKey, items: defaults, source: "default" };
    }

    // 4) fallback
    const fallback = await productionService.getAll();
    return { dateKey, items: fallback, source: "fallback" };
  },

  /**
   * Get plans for a date range inclusive.
   * Returns array sorted ascending by date.
   */
  async getPlansForRange(startDate: Date | string, endDate: Date | string) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const out: Array<{ dateKey: string; displayDate: string; items: ProductionItem[]; source: PlanWithSource["source"] }> = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const copy = new Date(d);
      const plan = await this.getPlanForDate(copy);
      out.push({ dateKey: plan.dateKey, displayDate: toDDMMYYYY(copy), items: plan.items, source: plan.source });
    }
    // sort ascending by dateKey (YYYY-MM-DD)
    out.sort((a, b) => a.dateKey.localeCompare(b.dateKey));
    return out;
  },
};
