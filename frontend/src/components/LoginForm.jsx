import { useState } from "react";
import { Form, Button, Alert, Toast, ToastContainer } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";

/**
 * LoginForm component for authenticating users.
 * Allows users to log in using email and password.
 * On successful login, stores token, shows a toast, and redirects.
 *
 * @component
 */
export default function LoginForm() {
  /** @type {[string, Function]} */
  const [email, setEmail] = useState("");

  /** @type {[string, Function]} */
  const [password, setPassword] = useState("");

  /** @type {[{type: string, text: string} | null, Function]} */
  const [msg, setMsg] = useState(null); // Error message

  /** @type {[boolean, Function]} */
  const [showToast, setShowToast] = useState(false);

  const navigate = useNavigate();

  /**
   * Handles login form submission and authentication.
   * @param {React.FormEvent} e
   */
  const submit = async (e) => {
    e.preventDefault();
    try {
      const data = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem("token", data.access_token);
      window.dispatchEvent(new Event("auth-change"));
      setMsg(null);
      setShowToast(true);
      setTimeout(() => navigate("/calories"), 2000);
    } catch (err) {
      setMsg({ type: "danger", text: err.message });
    }
  };

  return (
    <>
      <Form onSubmit={submit} className="p-3 shadow-sm bg-light rounded">
        {msg && <Alert variant={msg.type}>{msg.text}</Alert>}
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Form.Group>
        <Button type="submit" variant="primary" className="w-100">
          Login
        </Button>
      </Form>

      {/* Toast for successful login */}
      <ToastContainer position="top-end" className="p-3">
        <Toast
          bg="success"
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={2000}
          autohide
        >
          <Toast.Header closeButton={false}>
            <strong className="me-auto">Success</strong>
          </Toast.Header>
          <Toast.Body className="text-white">
            Logged in successfully! Redirecting…
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
}
