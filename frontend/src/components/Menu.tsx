import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Table, Modal, Form, Alert } from "react-bootstrap";

const API_BASE = "https://quickserve-7.onrender.com/api/v1/menu"; // Adjust based on your backend

interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
}

const MenuDashboard: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ id: 0, name: "", price: "", category: "" });
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");

  // Fetch all menu items
  const fetchMenuItems = async () => {
    try {
      const response = await axios.get(`${API_BASE}/all`, { withCredentials: true });

      const formattedMenu = response.data.map((item: any) => ({
        id: item.menu_item_id,
        name: item.name,
        price: parseFloat(item.price),
        category: item.category,
      }));

      setMenuItems(formattedMenu);
    } catch (err) {
      console.error("Error fetching menu items", err);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Open modal for add or edit
  const openModal = (item?: MenuItem) => {
    if (item) {
      setFormData({ ...item, price: item.price.toString() });
      setEditing(true);
    } else {
      setFormData({ id: 0, name: "", price: "", category: "" });
      setEditing(false);
    }
    setShowModal(true);
  };

  // Add or update menu item
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
      };

      if (editing) {
        await axios.put(`${API_BASE}/edit/${formData.id}`, payload, { withCredentials: true });
      } else {
        await axios.post(`${API_BASE}/add`, payload, { withCredentials: true });
      }

      fetchMenuItems();
      setShowModal(false);
    } catch (err) {
      setError("Error saving menu item. Ensure authentication.");
      console.error(err);
    }
  };

  // Delete menu item
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      await axios.delete(`${API_BASE}/delete/${id}`, { withCredentials: true });
      fetchMenuItems();
    } catch (err) {
      setError("Error deleting menu item.");
      console.error(err);
    }
  };

  return (
    <>
      <div className="container menu-container">
        <h2 className="menu-management-title">Menu Management</h2>
        {error && <Alert variant="danger">{error}</Alert>}

        {/* Menu Table */}
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {menuItems.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>${item.price.toFixed(2)}</td>
                <td>{item.category}</td>
                <td>
                  <Button variant="primary" size="sm" onClick={() => openModal(item)}>
                    Edit
                  </Button>{" "}
                  <Button variant="danger" size="sm" onClick={() => handleDelete(item.id)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        {/* Centered Add New Item Button */}
        <div className="text-center mt-4">
          <Button variant="primary" onClick={() => openModal()}>
            Add New Menu
          </Button>
        </div>

        {/* Add/Edit Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>{editing ? "Edit Menu Item" : "Add New Item"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              {/* Menu Name */}
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Menu Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter item name"
                  required
                />
              </Form.Group>

              {/* Price */}
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Price ($)</Form.Label>
                <Form.Control
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="Enter price"
                  required
                />
              </Form.Group>

              {/* Category */}
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Category</Form.Label>
                <Form.Control
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="Enter category (e.g., Drinks, Desserts)"
                  required
                />
              </Form.Group>

              <Button type="submit" className="mt-3">
                {editing ? "Update" : "Add"}
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
    </>
  );
};

export default MenuDashboard;
