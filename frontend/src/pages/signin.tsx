import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link, useNavigate } from "react-router-dom";

interface LoginForm {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const [formData, setFormData] = useState<LoginForm>({
    email: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  const navigate = useNavigate();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("http://localhost:3000/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrorMessage(errorData.message || "Login failed");
        return;
      }

      const data = await response.json();
      setSuccessMessage(data.message);
      navigate("/dashboard");
    } catch (error) {
      setErrorMessage("An error occurred. Please try again later.");
    }
  };

  return (
    <div
      className={`d-flex align-items-center justify-content-center h-100% ${
        theme === "dark" ? " text-white" : "bg-light text-dark"
      }`}
    >
      <div
        className={`card rounded-4  ${
          theme === "dark"
            ? "bg-dark text-white border-light"
            : "bg-white border-secondary"
        }`}
        style={{ width: "350px", marginTop: "110px" }}
      >
        <div className="card-body">
          <h2 className="text-center mb-4 fw-bold">Sign In</h2>

          {errorMessage && (
            <div className="alert alert-danger text-center">{errorMessage}</div>
          )}
          {successMessage && (
            <div className="alert alert-success text-center">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="form-control"
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="form-control"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary w-100 fw-semibold">
              Sign In
            </button>

            <div className="text-center mt-3">
              <p>
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className={`text-${theme === "dark" ? "light" : "primary"}`}
                >
                  SignUp
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
