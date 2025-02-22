import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Table, Container, Button, Badge, Spinner } from "react-bootstrap";
import "../styles/orders.css"; // Import CSS for styling

const API_BASE = "https://quickserve-7.onrender.com/api/v1/owner";

interface OrderItem {
  menu_item_id: number;
  menu_item_name: string;
  quantity: number;
  unit_price: number;
  subtotal_price: number;
}

interface Order {
  order_id: number;
  total_price: number;
  created_at: string;
  status: string;
  items: OrderItem[];
}

const TableOrders = () => {
  const { table_no } = useParams<{ table_no: string }>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<{ [key: number]: boolean }>({}); // ✅ Payment Button

  // Fetch orders for a specific table
  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API_BASE}/orders/${table_no}`, { withCredentials: true });
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [table_no]);

  // ✅ Mark All Orders as Served for a Hotel
  const markOrdersAsServed = async () => {
    try {
      await axios.put(`${API_BASE}/orders/${table_no}/serve`, {}, { withCredentials: true });

      // ✅ Update all orders in UI
      setOrders((prevOrders) =>
        prevOrders.map((order) => ({ ...order, status: "served" }))
      );
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  // ✅ Payment Button (Just UI)
  const togglePaymentStatus = (orderId: number) => {
    setPaymentStatus((prev) => ({
      ...prev,
      [orderId]: !prev[orderId], // Toggle payment status
    }));
  };

  return (
    <Container className="order-container">
      <h2 className="text-center">Orders for Table {table_no}</h2>

      {/* ✅ Single "Mark as Served" Button for All Orders */}
      {orders.some((order) => order.status !== "served") && (
        <div className="text-center my-3">
          <Button variant="success" onClick={markOrdersAsServed}>
            Mark All Orders as Served
          </Button>
        </div>
      )}

      {/* Show Spinner While Loading */}
      {loading && <Spinner animation="border" className="d-block mx-auto my-3" />}

      <Table striped bordered hover responsive className="order-table text-center">
        <thead>
          <tr>
            <th>Order No</th>
            <th>Items</th>
            <th>Quantity</th>
            <th>Unit Price ($)</th>
            <th>Subtotal ($)</th>
            <th>Total Price ($)</th>
            <th>Created At</th>
            <th>Status</th>
            <th>Payment</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td colSpan={9} className="text-center">No orders for this table</td>
            </tr>
          ) : (
            orders.map((order) => (
              <tr key={order.order_id}>
                <td>{order.order_id}</td>
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
                    <div key={item.menu_item_id}>${item.unit_price.toFixed(2)}</div>
                  ))}
                </td>
                <td>
                  {order.items.map((item) => (
                    <div key={item.menu_item_id}>${item.subtotal_price.toFixed(2)}</div>
                  ))}
                </td>
                <td>${order.total_price.toFixed(2)}</td>
                <td>{new Date(order.created_at).toLocaleString()}</td>

                {/* Status Badge */}
                <td>
                  <Badge bg={order.status === "served" ? "success" : "warning"}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </td>

                {/* Payment Button (Just UI) */}
                <td>
                  <Button
                    variant={paymentStatus[order.order_id] ? "success" : "danger"}
                    size="sm"
                    onClick={() => togglePaymentStatus(order.order_id)}
                  >
                    {paymentStatus[order.order_id] ? "Paid" : "Unpaid"}
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </Container>
  );
};

export default TableOrders;
