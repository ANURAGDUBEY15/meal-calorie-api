import React, { useState } from 'react';
import Spinner from './Spinner';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { api } from '../lib/api';

const registerSchema = z.object({
  first_name: z.string().min(2),
  last_name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
});

interface RegisterFormProps {
  darkMode?: boolean;
  setToast: (toast: { type: 'success' | 'error'; message: string } | null) => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ darkMode, setToast }) => {
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const result = registerSchema.safeParse(form);
    if (!result.success) {
      // Get the first error message from Zod
  const firstError = result.error.issues[0]?.message || 'Please fill all fields correctly.';
      setToast({ type: 'error', message: firstError });
      setTimeout(() => setToast(null), 3000);
      return;
    }
    setLoading(true);
    try {
      await api('/auth/register', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setToast({ type: 'success', message: 'Registration successful! Redirecting...' });
      setTimeout(() => setToast(null), 3000);
      navigate('/login');
    } catch (err: any) {
      let msg = 'Registration failed.';
      if (err && typeof err === 'object') {
        if (err.detail) {
          if (typeof err.detail === 'string') {
            msg = err.detail;
          } else if (Array.isArray(err.detail) && err.detail[0]?.msg) {
            msg = err.detail[0].msg;
          } else {
            msg = JSON.stringify(err.detail);
          }
        } else if (err.message) {
          msg = err.message;
        } else {
          msg = JSON.stringify(err);
        }
      }
      setToast({ type: 'error', message: msg });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={darkMode ? 'bg-gradient-to-br from-gray-900 to-indigo-900 min-h-screen flex items-center justify-center' : 'bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen flex items-center justify-center'}>
      <div className="card mt-5 shadow-lg border-0 rounded-4 p-4" style={{ maxWidth: 400, width: '100%', margin: '0 auto', background: darkMode ? '#18181b' : '#fff' }}>
        <div className="card-header text-center bg-transparent border-0 mb-3">
          <h3 className="font-weight-bold text-gradient text-primary mb-1" style={{ fontSize: '2rem', fontWeight: 700 }}>Create Account</h3>
          <p className="mb-0 text-secondary" style={{ fontSize: '1rem' }}>Join today to track your nutrition</p>
        </div>
        <form onSubmit={submit}>
          <div className="mb-3">
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input type="text" className="input input-lg form-control" placeholder="First Name" value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} required style={{ flex: 1 }} />
              <input type="text" className="input input-lg form-control" placeholder="Last Name" value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} required style={{ flex: 1 }} />
            </div>
          </div>
          <div className="mb-3">
            <input type="email" className="input input-lg form-control" placeholder="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          </div>
          <div className="mb-3">
            <input type="password" className="input input-lg form-control" placeholder="Password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
            <small className="form-text text-muted">Password must be at least 6 characters long</small>
          </div>
          <button type="submit" disabled={loading} className="btn btn-lg btn-primary w-100 text-white shadow-sm mt-2" style={{ fontWeight: 600, fontSize: '1.1rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {loading ? <><Spinner size={22} color="#fff" /> <span>Registering...</span></> : 'Create Account'}
          </button>
          <div className="text-center mt-3">
            Already have an account? <a href="/login" className="text-primary font-weight-bold">Login</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;
