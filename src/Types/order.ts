// src/Types/order.ts
import { Product } from "./product";

export type OrderItem = {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
  product?: Product; // optional, UI helper
};

export type OrderStatus = "pendente" | "concluido" | "cancelado";

export type Order = {
  id: string;
  customerName: string;
  items: OrderItem[];
  total: number;
  status?: OrderStatus;
  createdAt: string; // ISO string (set automatically)
  pickupAt?: string | null; // ISO string (horário aproximado de retirada)
  note?: string;
};
