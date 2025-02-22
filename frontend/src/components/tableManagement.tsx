import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Table, Form, Alert, Container } from "react-bootstrap";
import "../styles/navbar.css";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:3000/api/v1/tables";

interface TableData {
  table_no: number;
  qr_code_url: string;
}

const TableManagement: React.FC = () => {
  const [tables, setTables] = useState<TableData[]>([]);
  const [tableNumbers, setTableNumbers] = useState<string>("");
  const [error, setError] = useState("");
  const navigate = useNavigate(); // ✅ Hook to navigate programmatically

  // Fetch tables
  const fetchTables = async () => {
    try {
      const response = await axios.get(`${API_BASE}/all`, { withCredentials: true });
      setTables(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  // Handle table addition
  const handleAddTables = async () => {
    if (!tableNumbers.trim()) {
      return setError("Enter valid table number");
    }
    setError("");

    const tablesArray = tableNumbers
      .split(",")
      .map((num) => parseInt(num.trim()))
      .filter((num) => !isNaN(num));

    try {
      const response = await axios.post(
        `${API_BASE}/add`,
        { tables: tablesArray },
        { withCredentials: true }
      );

      fetchTables(); // Refresh table list
      setTableNumbers("");

      if (response.data.alreadyExists) {
        setError(
          `Some tables were not added as they already exist: ${response.data.alreadyExists.join(", ")}`
        );
      }
    } catch (err: any) {
      if (err.response?.status === 409) {
        setError(err.response.data.message);
      } else {
        setError("Error adding tables.");
      }
      console.error(err);
    }
  };

  return (
    <Container className="table-container">
      <h2 className="table-management-title">Table Management</h2>

      {/* Error Message */}
      {error && <Alert variant="danger" className="w-50 text-center">{error}</Alert>}

      {/* Form Section */}
      <div className="form-container">
        <h4 className="text-center">Add New Table</h4>
        <Form>
          <Form.Group>
            <Form.Control
              type="text"
              placeholder="Enter table number"
              value={tableNumbers}
              onChange={(e) => setTableNumbers(e.target.value)}
              className="text-left"
            />
          </Form.Group>
          <div className="d-flex justify-content-center">
            <Button className="mt-2" onClick={handleAddTables}>
              Generate QR Code
            </Button>
          </div>
        </Form>
      </div>

      {/* Table Section */}
      <div className="table-wrapper">
        <Table striped bordered hover className="text-center">
          <thead>
            <tr>
              <th>Table No</th>
              <th>QR Code</th>
            </tr>
          </thead>
          <tbody>
            {tables.map((table) => (
              <tr key={table.table_no}>
                <td>{table.table_no}</td>
                <td>
                  <img src={table.qr_code_url} alt={`QR for Table ${table.table_no}`} width={100} />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* ✅ "Add New Table" Button - Redirects to /tablemanagement */}
            <div className="text-center mt-4">
              <Button variant="primary" onClick={() => navigate("/dashboard")}>
                Move To Dashboard
              </Button>
            </div>

    </Container>
  );
};

export default TableManagement;
