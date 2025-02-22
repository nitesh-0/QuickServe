import React from "react";
import { Container, Row, Col, Button} from "react-bootstrap";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./pages/signup";
import Login from "./pages/signin";
import Dashboard from "./pages/dashboard";
import MenuDashboard from './components/Menu';
import TableManagement from "./components/tableManagement";
import Layout from "./components/Layout"; // Layout with Navbar
import "./styles/navbar.css";
import TableOrders from "./components/TableOrder";
import PlaceOrder from "./components/PlaceOrder";
import PaymentQRCodeUpload from "./components/Payment";


const Home: React.FC = () => {
  return (
    <div className="hero-container">
    <Container fluid className="hero-content">
      <Row className="w-100 d-flex align-items-center justify-content-center">
        {/* Left Section - Text */}
        <Col md={6} className="text-section">
          <h1 className="hero-title">Revolutionizing Restaurant Ordering</h1>
          <p className="hero-description">
            🚀 Say goodbye to waiting for waiters! Let your customers **order instantly** by scanning a QR code at their table. 
            **Faster service, happier customers!**
          </p>
          <Link to="/signup">
            <Button variant="warning" size="lg" className="mt-3 hero-button">Get Started</Button>
          </Link>
        </Col>

        {/* Right Section - QR Code */}
        <Col md={5} className="d-flex justify-content-center">
          <div className="qr-box">
            <svg width="150" height="150" viewBox="0 0 24 24" className="qr-icon">
              <rect x="2" y="2" width="8" height="8" stroke="black" strokeWidth="2" fill="white"/>
              <rect x="14" y="2" width="8" height="8" stroke="black" strokeWidth="2" fill="white"/>
              <rect x="2" y="14" width="8" height="8" stroke="black" strokeWidth="2" fill="white"/>
              <path d="M14 14H22V22H14V14ZM16 16V18H18V16H16ZM18 20H16V22H18V20ZM20 18V16H22V18H20ZM20 20H22V22H20V20Z" fill="black"/>
            </svg>
            <p className="qr-text">📲 Scan & Order</p>
          </div>
        </Col>
      </Row>
    </Container>
  </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
      <Route path="/" element={<Layout />}>
        <Route path="/" element={<Home />} /> {/* Home page route */}       
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/menu" element={<MenuDashboard />} />
        <Route path="/tables" element={<TableManagement />} />
        <Route path="/orders/:table_no" element={<TableOrders/>} />
        <Route path="/menu/:hotelId/:table_no" element={<PlaceOrder />} />
        <Route path="/payment" element={<PaymentQRCodeUpload />} />
         <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Login />} />
        </Route>
       
      </Routes>
    </Router>
  );
};

export default App;
