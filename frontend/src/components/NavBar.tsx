import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/navbar.css"; // Custom styles

const NavbarComponent = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  // ✅ Check if URL matches /menu/:hotelId/:tableNo
  const isMenuPage = /^\/menu\/\d+\/\d+$/.test(location.pathname);
  const isSignupPage = location.pathname === "/signup";
  const isSigninPage = location.pathname === "/signin";

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  // Toggle theme function
  const toggleTheme = () => {
    const newTheme = darkMode ? "light" : "dark";
    setDarkMode(!darkMode);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  // Apply theme on initial load
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
    setDarkMode(savedTheme === "dark");
  }, []);

  return (
    <nav className="navbar">
      {/* Left: Hotel Brand */}
      <Link to="/" className="navbar-brand">
        🍽️ QuickServe
      </Link>

      {/* Right: Conditional Navigation Links */}
      <ul className="navbar-links">
        {isHomePage ? (
          <>
            <li><Link to="/signin" className="nav-link">Signin</Link></li>
            <li><Link to="/signup" className="nav-link">Register</Link></li>
          </>
        ) : isMenuPage || isSignupPage || isSigninPage ? null : (  // ✅ Hides links if on /menu/:hotelId/:tableNo
          <>
            <li><Link to="/dashboard" className="nav-link">Dashboard</Link></li>
            <li><Link to="/menu" className="nav-link">Menu Management</Link></li>
            <li><Link to="/tables" className="nav-link">Table Management</Link></li>
            <li><Link to="/payment" className="nav-link">Payment Detail</Link></li>
          </>
        )}
        <li>
          {/* Theme Toggle Button */}
          <button onClick={toggleTheme} className="theme-toggle">
            {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default NavbarComponent;
