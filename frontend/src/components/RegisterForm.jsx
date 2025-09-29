import { useState } from "react";
import { Form, Button, Alert, Toast, ToastContainer } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";

/**
 * RegisterForm component for new user registration.
 * Collects user's name, email, and password, and submits to backend.
 * Shows success toast and redirects to login page.
 *
 * @component
 */
export default function RegisterForm() {
  /** @type {[Object, Function]} */
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });

  /** @type {[{type: string, text: string} | null, Function]} */
  const [msg, setMsg] = useState(null); // Error message

  /** @type {[boolean, Function]} */
  const [showToast, setShowToast] = useState(false);

  const navigate = useNavigate();

  /**
   * Handles form submission to register new user.
   * @param {React.FormEvent} e
   */
  const submit = async (e) => {
    e.preventDefault();
    try {
      await api("/auth/register", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setShowToast(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setMsg({ type: "danger", text: err.message });
    }
  };

  return (
    <>
      <Form onSubmit={submit} className="p-3 shadow-sm bg-light rounded">
        {msg && <Alert variant={msg.type}>{msg.text}</Alert>}

        {["first_name", "last_name", "email", "password"].map((field) => (
          <Form.Group className="mb-3" key={field}>
            <Form.Label>{field.replace("_", " ")}</Form.Label>
            <Form.Control
              type={field === "password" ? "password" : "text"}
              value={form[field]}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              required
            />
          </Form.Group>
        ))}

        <Button type="submit" variant="primary" className="w-100">
          Register
        </Button>
      </Form>

      {/* Toast for successful registration */}
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
            Registered successfully! Redirecting to login…
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
}
