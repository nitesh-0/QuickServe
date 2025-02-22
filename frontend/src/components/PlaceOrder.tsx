import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  Card,
  Button,
  ListGroup,
  Spinner,
  Modal,
  Alert,
  Container,
  Image,
} from "react-bootstrap";
import "../styles/navbar.css";
import "../styles/placeorder.css";

const API_BASE = "http://localhost:3000/api/v1/orders";

interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
}

interface SelectedItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface OrderItem {
  menu_item_name: string;
  quantity: number;
  subtotal_price: string | number;
}

interface Order {
  order_id: number;
  total_price: string | number;
  created_at: string;
  status: string;
  items: OrderItem[];
}

const PlaceOrder: React.FC = () => {
  const { hotelId, table_no } = useParams<{
    hotelId: string;
    table_no: string;
  }>();

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const navigate = useNavigate(); // ✅ Hook to navigate programmatically

  // ✅ Fetch menu items
  useEffect(() => {
    console.log("Fetching menu for Hotel ID:", hotelId);
    const fetchMenuItems = async () => {
      try {
        const response = await axios.get(`${API_BASE}/menu/${hotelId}`);
        console.log("Menu Data:", response.data);
        setMenuItems(
          response.data.map((item: MenuItem) => ({
            ...item,
            price: Number(item.price), // ✅ Convert to number
          }))
        );
      } catch (err) {
        setError("Error fetching menu items.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, [hotelId]);

  // ✅ Fetch orders for the table
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`${API_BASE}/table-orders/${hotelId}/${table_no}`);
        const formattedOrders = response.data
          .filter((order: Order) => order.status === "pending" || order.status === "unserved") // ✅ Only keep pending/unserved orders
          .map((order: Order) => ({
            ...order,
            total_price: Number(order.total_price),
            items: order.items.map((item) => ({
              ...item,
              subtotal_price: Number(item.subtotal_price),
            })),
          }));

        setOrders(formattedOrders);
      } catch (err) {
        console.error("Error fetching table orders:", err);
      }
    };

    fetchOrders();
  }, [hotelId, table_no]);

  // ✅ Add item to order
  const addItem = (menuItem: MenuItem) => {
    setSelectedItems((prev) => {
      const existing = prev.find((item) => item.id === menuItem.id);
      if (existing) {
        return prev.map((item) =>
          item.id === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...menuItem, quantity: 1 }];
    });
  };

  // ✅ Remove item from order
  const removeItem = (id: number) => {
    setSelectedItems((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // ✅ Place order
  const placeOrder = async () => {
    if (selectedItems.length === 0) {
      setError("No items selected.");
      return;
    }

    try {
      await axios.post(
        `${API_BASE}/place-order`,
        { hotelId, table_no, items: selectedItems },
        { withCredentials: true }
      );

      setShowSuccessModal(true);
      setSelectedItems([]); // ✅ Clear selected items after placing order
    } catch (err) {
      setError("Error placing order.");
      console.error(err);
    }
  };

  // ✅ Cancel order
  const cancelOrder = async (orderId: number) => {
    try {
      await axios.delete(`${API_BASE}/cancel-order/${orderId}`);
      setOrders((prevOrders) =>
        prevOrders.filter((order) => order.order_id !== orderId)
      );
    } catch (err) {
      console.error("Error cancelling order:", err);
    }
  };



  const [showModal, setShowModal] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);

  // ✅ Load QR Code from localStorage when component mounts
  useEffect(() => {
    const savedQrCode = localStorage.getItem("qrCodeImage");
    if (savedQrCode) {
      setQrCode(savedQrCode);
    }
  }, []);

  // ✅ Handle "Make Payment" button click
  const handleShowModal = () => {
    if (!qrCode) {
      alert("No Payment QR Code found. Please upload a QR Code first.");
      return;
    }
    setShowModal(true);
  };




  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Today's Menu</h2>

      {error && (
        <Alert variant="danger" className="text-center">
          {error}
        </Alert>
      )}
      {loading && <Spinner animation="border" className="d-block mx-auto" />}

      {/* ✅ Menu List */}
      <div className="d-flex flex-column align-items-center">
        {menuItems.length > 0
          ? menuItems.map((item) => (
              <Card key={item.id} className="mb-3 w-50 shadow-sm">
                <Card.Body className="d-flex justify-content-between align-items-center w-130">
                  <div className="d-grid grid-template w-100">
                    <Card.Title className="mb-0">{item.name}</Card.Title>
                    <Card.Subtitle className="text-muted">
                      ${item.price.toFixed(2)}
                    </Card.Subtitle>
                    <Card.Text className="text-secondary">
                      {item.category}
                    </Card.Text>
                  </div>
                  <Button
                    variant="success"
                    className="ml-auto"
                    onClick={() => addItem(item)}
                  >
                    Add to Order
                  </Button>
                </Card.Body>
              </Card>
            ))
          : !loading && <p className="text-center">No menu items available.</p>}
      </div>

      {/* ✅ Selected Items */}
      {selectedItems.length > 0 && (
        <>
          <h3 className="text-center mt-4">Selected Items</h3>
          <ListGroup className="w-50 mx-auto selected-items-container">
            {selectedItems.map((item) => (
              <ListGroup.Item
                key={item.id}
                className="d-flex justify-content-between align-items-center"
              >
                {item.name} x {item.quantity} - ${item.price * item.quantity}
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => removeItem(item.id)}
                >
                  -
                </Button>
              </ListGroup.Item>
            ))}
          </ListGroup>

          <div className="text-center mt-3">
            <Button variant="primary" onClick={placeOrder}>
              Place Order
            </Button>
          </div>
        </>
      )}

      {/* ✅ Orders List */}
      {orders.length > 0 && (
        <>
          <h3 className="text-center mt-5">Orders for Table {table_no}</h3>
          <ListGroup className="w-50 mx-auto">
            {orders.map((order) => (
              <ListGroup.Item
                key={order.order_id}
                className="d-flex flex-column"
              >
                <strong>Order No: {order.order_id}</strong>
                <p>Total: ${order.total_price.toFixed(2)}</p>
                <p>Placed At: {new Date(order.created_at).toLocaleString()}</p>
                <p>
                  Status:{" "}
                  <span
                    className={
                      order.status === "served"
                        ? "text-success"
                        : "text-warning"
                    }
                  >
                    {order.status}
                  </span>
                </p>
                <ul>
                  {order.items.map((item, index) => (
                    <li key={index}>
                      {item.menu_item_name} x {item.quantity} - $
                      {item.subtotal_price.toFixed(2)}
                    </li>
                  ))}
                </ul>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => cancelOrder(order.order_id)}
                >
                  Cancel Order
                </Button>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </>
      )}
      {/* Success Popup */}
      {/* Success Popup */}
      <Modal
        show={showSuccessModal}
        onHide={() => setShowSuccessModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="text-success fw-bold">
            ✅ Order Placed Successfully
          </Modal.Title>
        </Modal.Header>

        <Modal.Footer className="d-flex justify-content-center">
          <Button
            variant="success"
            size="lg"
            onClick={() => setShowSuccessModal(false)}
          >
            OK
          </Button>
        </Modal.Footer>
      </Modal>

      <Container className="text-center mt-4">
      {/* ✅ "Make Payment" Button - Opens the QR Code Modal */}
      <Button variant="primary" onClick={handleShowModal}>
        Make Payment
      </Button>

      {/* ✅ Payment QR Code Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Scan to Pay</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {qrCode ? (
            <>
              <p>Scan the QR code below to complete your payment.</p>
              <Image
                src={qrCode}
                alt="Payment QR Code"
                fluid
                className="border p-2"
                style={{ maxWidth: "250px" }}
              />
            </>
          ) : (
            <Alert variant="warning">No QR Code available. Please upload one.</Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>

    </div>
  );
};

export default PlaceOrder;
