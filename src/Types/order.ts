import { Product } from "./product";

export type OrderItem = {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
  product?: Product; // optional, help for UI
};

export type OrderStatus = "pendente" | "concluido" | "cancelado";

export type Order = {
  id: string;
  customerName: string;
  items: OrderItem[];
  total: number;
  status?: OrderStatus;
  createdAt: string; // ISO
};
