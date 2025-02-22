import { Outlet } from "react-router-dom";
import NavbarComponent from "./NavBar"; // Import Navbar

const Layout = () => {
  return (
    <>
      <NavbarComponent /> {/* Navbar stays on all pages */}
      <div className="page-content">
        <Outlet /> {/* This will render the page content dynamically */}
      </div>
    </>
  );
};

export default Layout;