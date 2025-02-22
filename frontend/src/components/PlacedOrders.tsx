import { useEffect, useState } from "react";
import axios from "axios";
import { Button, Table } from "react-bootstrap";

const API_BASE = "https://quickserve-7.onrender.com/api/v1/owner/orders";

interface OrderItem {
  menu_item_id: number;
  menu_item_name: string;
  quantity: number;
  unit_price: number;
  subtotal_price: number;
}

interface Order {
  order_id: number;
  table_no: number;
  total_price: number;
  created_at: string;
  status: string;
  items: OrderItem[];
}

const OwnerDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(API_BASE, { withCredentials: true });

        const formattedOrders = response.data.map((order: any) => ({
          ...order,
          total_price: Number(order.total_price), // Ensure price is a number
          created_at: new Date(order.created_at).toLocaleString(), // Format date
        }));

        setOrders(formattedOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, []);

  // Function to update order status
  const updateOrderStatus = async (orderId: number) => {
    try {
      await axios.put(
        `${API_BASE}/${orderId}`,
        { status: "served" },
        { withCredentials: true }
      );

      // Remove the order from UI
      setOrders((prevOrders) =>
        prevOrders.filter((order) => order.order_id !== orderId)
      );
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Orders for Your Restaurant</h2>
      <Table striped bordered hover responsive className="text-center">
        <thead className="thead-dark">
          <tr>
            <th>Order No</th>
            <th>Table No</th>
            <th>Items</th>
            <th>Quantity</th>
            <th>Unit Price ($)</th>
            <th>Subtotal ($)</th>
            <th>Total Price ($)</th>
            <th>Created At</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td colSpan={9} className="text-center">
                No orders available
              </td>
            </tr>
          ) : (
            orders.map((order) => (
              <tr key={order.order_id}>
                <td>{order.order_id}</td>
                <td>{order.table_no}</td>
                <td>
                  {order.items.map((item) => (
                    <div key={item.menu_item_id}>{item.menu_item_name}</div>
                  ))}
                </td>
                <td>
                  {order.items.map((item) => (
                    <div key={item.menu_item_id}>{item.quantity}</div>
                  ))}
                </td>
                <td>
                  {order.items.map((item) => (
                    <div key={item.menu_item_id}>
                      ${item.unit_price.toFixed(2)}
                    </div>
                  ))}
                </td>
                <td>
                  {order.items.map((item) => (
                    <div key={item.menu_item_id}>
                      ${item.subtotal_price.toFixed(2)}
                    </div>
                  ))}
                </td>
                <td>${order.total_price.toFixed(2)}</td>
                <td>{order.created_at}</td>
                <td>
                  {order.status === "pending" ? (
                    <Button
                      variant="warning"
                      size="sm"
                      onClick={() => updateOrderStatus(order.order_id)}
                    >
                      Mark as Served
                    </Button>
                  ) : (
                    <Button variant="success" size="sm" disabled>
                      Served
                    </Button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default OwnerDashboard;
