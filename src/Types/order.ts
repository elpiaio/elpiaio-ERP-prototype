// src/Types/order.ts
import { Product } from "./product";

export type OrderItem = {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
  product?: Product;
};

export type OrderStatus = "pendente" | "concluido" | "cancelado";

export type Order = {
  id: string;
  customerName: string;
  items: OrderItem[];
  total: number;
  status?: OrderStatus;
  createdAt: string; // ISO
  pickupAt?: string | null; // ISO
  note?: string;
  createdBy?: string | null; // usuario que criou o pedido
};
