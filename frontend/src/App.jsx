import { Container, Navbar, Nav } from "react-bootstrap";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import RegisterForm from "./components/RegisterForm";
import LoginForm from "./components/LoginForm";
import CalorieForm from "./components/CalorieForm";

/**
 * Main App component that handles routing and navigation.
 * Dynamically shows login/register or calorie tools based on auth state.
 *
 * @component
 */
export default function App() {
  /** @type {[boolean, Function]} isLoggedIn - Whether the user is authenticated */
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(localStorage.getItem("token")));
  const navigate = useNavigate();

  // 📦 Keep state in sync with storage changes (e.g. across tabs)
  useEffect(() => {
    const onStorage = () => setIsLoggedIn(Boolean(localStorage.getItem("token")));
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // 🔄 React to custom "auth-change" events
  useEffect(() => {
    const updateAuth = () => setIsLoggedIn(Boolean(localStorage.getItem("token")));
    window.addEventListener("auth-change", updateAuth);
    window.addEventListener("storage", updateAuth);
    return () => {
      window.removeEventListener("auth-change", updateAuth);
      window.removeEventListener("storage", updateAuth);
    };
  }, []);

  /**
   * Logs the user out and redirects to login.
   */
  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="sm">
        <Container>
          <Navbar.Brand as={Link} to="/">Meal Calorie Counter</Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/register">Register</Nav.Link>

            {!isLoggedIn ? (
              <Nav.Link as={Link} to="/login">Login</Nav.Link>
            ) : (
              <>
                <Nav.Link as={Link} to="/calories">Get Calories</Nav.Link>
                <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
              </>
            )}
          </Nav>
        </Container>
      </Navbar>

      <Container className="mt-4">
        <Routes>
          <Route path="/" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/calories" element={<CalorieForm />} />
        </Routes>
      </Container>
    </>
  );
}
