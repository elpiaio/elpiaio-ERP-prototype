import { Product } from "@/Types/product";
import { fetchJson } from "@/Libs/api";

const PROD_KEY = "mock_products_v1";

export const productService = {
  async getAll(): Promise<Product[]> {
    // tenta localStorage -> se não, faz fetch do mock
    try {
      const raw = localStorage.getItem(PROD_KEY);
      if (raw) return JSON.parse(raw) as Product[];
    } catch {
      localStorage.removeItem(PROD_KEY);
    }
    const data = await fetchJson<Product[]>("/mock/products.json");
    try {
      localStorage.setItem(PROD_KEY, JSON.stringify(data));
    } catch {}
    return data;
  },

  // util dev: limpa cache local
  async clearCache() {
    localStorage.removeItem(PROD_KEY);
  },
};
