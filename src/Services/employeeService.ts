// src/Services/employeeService.ts
import { fetchJson } from "@/Libs/api";

export type Employee = { id: string; name: string };

const KEY = "mock_employees_v1";

export const employeeService = {
  async getAll(): Promise<Employee[]> {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      localStorage.removeItem(KEY);
    }
    const data = await fetchJson<Employee[]>("/mock/employees.json");
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch {}
    return data;
  }
};
