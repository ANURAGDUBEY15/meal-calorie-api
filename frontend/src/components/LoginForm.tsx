import React, { useEffect, useState } from 'react';
import Spinner from './Spinner';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { api } from '../lib/api';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

interface LoginFormProps {
  darkMode?: boolean;
  setToast: (toast: { type: 'success' | 'error'; message: string } | null) => void;
}

/**
 * LoginForm component for user authentication.
 * Allows users to log in with email and password, shows validation and error messages, and handles redirection on success.
 *
 * @component
 * @param {Object} props
 * @param {boolean} [props.darkMode] - Whether dark mode is enabled
 * @param {(toast: { type: 'success' | 'error'; message: string } | null) => void} props.setToast - Function to show toast messages
 * @returns {JSX.Element}
 */

const LoginForm: React.FC<LoginFormProps> = ({ darkMode, setToast }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});
  const navigate = useNavigate();
  const setToken = useAuthStore(state => state.setToken);

  useEffect(() => {
    const original = document.body.style.background;
    document.body.style.background = `url('/health-bg.svg') center center / cover no-repeat fixed`;
    return () => { document.body.style.background = original; };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setTouched({ email: true, password: true });
    if (!form.email || !form.password) return;
    const result = loginSchema.safeParse(form);
    if (!result.success) {
      setToast({ type: 'error', message: 'Please enter a valid email and password.' });
      setTimeout(() => setToast(null), 3000);
      return;
    }
    setLoading(true);
    try {
      const data = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setToken(data.access_token);
      window.dispatchEvent(new Event('auth-change'));
      setToast({ type: 'success', message: 'Login successful! Redirecting...' });
      setTimeout(() => {
        setToast(null);
        navigate('/calories');
      }, 1200);
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Login failed. Please check your credentials and try again.' });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      paddingTop: '6vh',
    }}>
      <div className="card mt-5 shadow-lg border-0 rounded-4 p-3 p-md-4 mx-2 mx-md-auto" style={{ maxWidth: 480, width: '100%', background: darkMode ? '#18181b' : '#fff' }}>
        <div className="card-header text-center bg-transparent border-0 mb-3">
          <h3 className="font-weight-bold text-gradient text-primary mb-1" style={{ fontSize: '2rem', fontWeight: 700 }}>Login</h3>
          <p className="mb-0 text-secondary" style={{ fontSize: '1rem' }}>Welcome back! Please login to continue</p>
        </div>
        <form onSubmit={submit} noValidate>
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
              className={`form-control form-control-lg${touched.password && !form.password ? ' is-invalid' : ''}`}
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              onBlur={() => setTouched(t => ({ ...t, password: true }))}
              autoComplete="current-password"
            />
            {touched.password && !form.password && (
              <div className="invalid-feedback text-start">Password is required.</div>
            )}
          </div>
          <button type="submit" disabled={loading} className="btn btn-lg btn-primary w-100 text-white shadow-sm mt-2" style={{ fontWeight: 600, fontSize: '1.1rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {loading ? <><Spinner size={22} color="#fff" /> <span>Logging in...</span></> : 'Login'}
          </button>
          <div className="text-center mt-3">
            Don't have an account? <a href="/register" className="text-primary font-weight-bold">Sign up</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
