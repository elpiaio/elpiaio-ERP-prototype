// src/Libs/productionUtils.ts
import { ProductionItem } from "@/Types/production";

/** calcula o total em unidades (quando breakdown definido) ou retorna quantity por padrão */
export function computeTotalUnits(item: ProductionItem): number {
  const b = item.breakdown;
  if (!b) {
    // quantity already in units
    // assume that if unit is "unidades" it's direct units, otherwise return quantity (e.g., armários)
    return item.unit === "unidades" ? item.quantity : item.quantity;
  }
  // breakdown present: use hierarchy numbers if possible
  const l1 = b.level1Count ?? item.quantity; // if level1Count set use it else use item.quantity
  const perL1 = b.level2PerLevel1 ?? 1;
  const perL2 = b.unitsPerLevel2 ?? 1;
  return l1 * perL1 * perL2;
}

/** friendly description of breakdown */
export function breakdownLabel(item: ProductionItem): string | null {
  const b = item.breakdown;
  if (!b) return null;
  const level1 = `${b.level1Count ?? item.quantity} ${b.level1Name}${(b.level1Count ?? item.quantity) > 1 ? "s" : ""}`;
  if (b.level2Name && b.level2PerLevel1 && b.unitsPerLevel2) {
    return `${level1} → ${b.level2PerLevel1} ${b.level2Name}s por ${b.level1Name} → ${b.unitsPerLevel2} unidades por ${b.level2Name}`;
  }
  return level1;
}
