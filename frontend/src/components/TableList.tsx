import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Container, Button } from "react-bootstrap";
import { FaTable, FaPlus } from "react-icons/fa"; // Table & Add Icon
import "../styles/tables.css"; // Ensure you include this CSS file

const API_BASE = "http://localhost:3000/api/v1/owner";

interface TableData {
  table_id: number;
  table_no: number;
}

const TablesList = () => {
  const [tables, setTables] = useState<TableData[]>([]);
  const navigate = useNavigate(); // ✅ Hook to navigate programmatically

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await axios.get(`${API_BASE}/tables`, { withCredentials: true });
        setTables(response.data);
      } catch (error) {
        console.error("Error fetching tables:", error);
      }
    };

    fetchTables();
  }, []);

  return (
    <Container className="table-page-container">
      <h2 className="table-heading">Select a Table</h2>

      {/* ✅ "Add New Table" Button - Redirects to /tablemanagement */}
      <div className="text-center mb-4">
        <Button variant="primary" onClick={() => navigate("/tables")}>
          <FaPlus className="me-2" /> Add New Table
        </Button>
      </div>

      <div className="table-grid">
        {tables.map((table) => (
          <Link key={table.table_no} to={`/orders/${table.table_no}`} className="table-button">
            <FaTable className="table-icon" />
            <span className="table-text">Table {table.table_no}</span>
          </Link>
        ))}
      </div>
    </Container>
  );
};

export default TablesList;
