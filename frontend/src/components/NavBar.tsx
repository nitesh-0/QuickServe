import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/navbar.css"; // Custom styles

const NavbarComponent = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  const isMenuPage = /^\/menu\/\d+\/\d+$/.test(location.pathname);
  const isSignupPage = location.pathname === "/signup";
  const isSigninPage = location.pathname === "/signin";

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  const [isOpen, setIsOpen] = useState(false);

  const toggleTheme = () => {
    const newTheme = darkMode ? "light" : "dark";
    setDarkMode(!darkMode);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
    setDarkMode(savedTheme === "dark");
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        🍽️ QuickServe
      </Link>

      {/* Hamburger Icon */}
      <button className="hamburger" onClick={toggleMenu}>
        ☰
      </button>

      <ul className={`navbar-links ${isOpen ? "open" : ""}`}>
        {isHomePage ? (
          <>
            <li><Link to="/signin" className="nav-link" onClick={toggleMenu}>Signin</Link></li>
            <li><Link to="/signup" className="nav-link" onClick={toggleMenu}>Register</Link></li>
          </>
        ) : isMenuPage || isSignupPage || isSigninPage ? null : (
          <>
            <li><Link to="/dashboard" className="nav-link" onClick={toggleMenu}>Dashboard</Link></li>
            <li><Link to="/menu" className="nav-link" onClick={toggleMenu}>Menu Management</Link></li>
            <li><Link to="/tables" className="nav-link" onClick={toggleMenu}>Table Management</Link></li>
            <li><Link to="/payment" className="nav-link" onClick={toggleMenu}>Payment</Link></li>
          </>
        )}
        <li>
          <button onClick={toggleTheme} className="theme-toggle">
            {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default NavbarComponent;
