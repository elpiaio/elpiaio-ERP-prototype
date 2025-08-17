import React, { useEffect } from "react";
import { useOrderStore } from "../../Store/orderStore";

export const OrderList: React.FC = () => {
  const { orders, fetchOrders, loading } = useOrderStore();

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  if (loading) return <p>Loading orders...</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Orders</h2>
      {orders.length === 0 ? (
        <p>No orders found</p>
      ) : (
        <ul className="space-y-2">
          {orders.map((order) => (
            <li key={order.id} className="p-2 border rounded">
              <p><strong>Customer:</strong> {order.customerName}</p>
              <p><strong>Total:</strong> ${order.total.toFixed(2)}</p>
              <p><strong>Created At:</strong> {order.createdAt.toString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
