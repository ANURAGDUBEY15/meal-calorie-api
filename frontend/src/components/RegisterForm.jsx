/**
 * RegisterForm component for new user registration.
 * Collects user's name, email, and password, and submits to backend. Shows success toast and redirects to login page.
 *
 * @component
 * @param {Object} props
 * @param {boolean} [props.darkMode] - Whether dark mode is enabled
 * @param {(toast: { type: 'success' | 'error'; message: string } | null) => void} props.setToast - Function to show toast messages
 * @returns {JSX.Element}
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";

export default function RegisterForm({ darkMode = false, setToast }) {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});
  const [msg, setMsg] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const navigate = useNavigate();

  const isPasswordValid = form.password.length >= 8;

  const submit = async (e) => {
    e.preventDefault();
    setTouched({ first_name: true, last_name: true, email: true, password: true });
    if (!form.first_name || !form.last_name || !form.email || !form.password || !isPasswordValid) return;
    setMsg(null);
    setLoading(true);
    try {
      await api("/auth/register", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setShowToast(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      // User-friendly error messages
      let message = 'Registration failed. Please try again.';
      if (err && err.message) {
        if (err.message.toLowerCase().includes('email')) {
          message = 'This email is already registered.';
        } else if (err.message.toLowerCase().includes('password')) {
          message = 'Password does not meet requirements.';
        } else if (err.message.toLowerCase().includes('required')) {
          message = 'Please fill in all required fields.';
        } else {
          message = err.message;
        }
      }
      setMsg({ type: "danger", text: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    }}>
      <div className="card mt-5 shadow-lg border-0 rounded-4 p-3 p-md-4 mx-2 mx-md-auto" style={{ maxWidth: 480, width: '100%', background: darkMode ? '#18181b' : '#fff' }}>
        <div className="card-header text-center bg-transparent border-0 mb-3">
          <h3 className="font-weight-bold text-gradient text-primary mb-1" style={{ fontSize: '2rem', fontWeight: 700 }}>Register</h3>
          <p className="mb-0 text-secondary" style={{ fontSize: '1rem' }}>Create your account</p>
        </div>
        <form onSubmit={submit} noValidate>
          {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
          <div className="mb-3">
            <input
              className={`form-control form-control-lg${touched.first_name && !form.first_name ? ' is-invalid' : ''}`}
              type="text"
              placeholder="First Name"
              value={form.first_name}
              onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))}
              onBlur={() => setTouched(t => ({ ...t, first_name: true }))}
              autoComplete="given-name"
            />
            {touched.first_name && !form.first_name && (
              <div className="invalid-feedback text-start">First name is required.</div>
            )}
          </div>
          <div className="mb-3">
            <input
              className={`form-control form-control-lg${touched.last_name && !form.last_name ? ' is-invalid' : ''}`}
              type="text"
              placeholder="Last Name"
              value={form.last_name}
              onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))}
              onBlur={() => setTouched(t => ({ ...t, last_name: true }))}
              autoComplete="family-name"
            />
            {touched.last_name && !form.last_name && (
              <div className="invalid-feedback text-start">Last name is required.</div>
            )}
          </div>
          <div className="mb-3">
            <input
              className={`form-control form-control-lg${touched.email && !form.email ? ' is-invalid' : ''}`}
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              onBlur={() => setTouched(t => ({ ...t, email: true }))}
              autoComplete="email"
            />
            {touched.email && !form.email && (
              <div className="invalid-feedback text-start">Email is required.</div>
            )}
          </div>
          <div className="mb-3">
            <input
              className={`form-control form-control-lg${touched.password && (!form.password || !isPasswordValid) ? ' is-invalid' : ''}`}
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              onBlur={() => setTouched(t => ({ ...t, password: true }))}
              autoComplete="new-password"
            />
            {touched.password && !form.password && (
              <div className="invalid-feedback text-start">Password is required.</div>
            )}
            {touched.password && form.password && !isPasswordValid && (
              <div className="invalid-feedback text-start">Password must be at least 8 characters.</div>
            )}
          </div>
          <button type="submit" disabled={loading} className="btn btn-lg btn-primary w-100 text-white shadow-sm mt-2" style={{ fontWeight: 600, fontSize: '1.1rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {loading ? <span>Registering...</span> : 'Register'}
          </button>
          <div className="text-center mt-3">
            Already have an account? <a href="/login" className="text-primary font-weight-bold">Login</a>
          </div>
        </form>
        {/* Toast for successful registration */}
        <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 9999 }}>
          <div className={`toast align-items-center text-white bg-success border-0${showToast ? ' show' : ''}`} role="alert" aria-live="assertive" aria-atomic="true">
            <div className="d-flex">
              <div className="toast-body">Registered successfully! Redirecting to login…</div>
              <button type="button" className="btn-close btn-close-white me-2 m-auto" aria-label="Close" onClick={() => setShowToast(false)}></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
