import React, { useState } from 'react';
import { api } from '../lib/api';
import { z } from 'zod';
import styles from './CalorieForm.module.scss';
import Autocomplete from './Autocomplete';
import Spinner from './Spinner';
import { dishSuggestions } from '../constants/dishSuggestions';

const calorieSchema = z.object({
  dish_name: z.string().min(2),
  servings: z.number().min(1),
});

type CalorieResult = {
  dish_name: string;
  servings: number;
  calories_per_serving: number;
  total_calories: number;
  source: string;
};

interface CalorieFormProps {
  setToast: (toast: { type: 'success' | 'error'; message: string } | null) => void;
  darkMode?: boolean;
}

/**
 * CalorieForm component for calorie lookup and meal logging.
 * Lets users search for dishes, fetch calories, and log meals. Shows results and meal history.
 *
 * @component
 * @param {Object} props
 * @param {(toast: { type: 'success' | 'error'; message: string } | null) => void} props.setToast - Function to show toast messages
 * @param {boolean} [props.darkMode] - Whether dark mode is enabled
 * @returns {JSX.Element}
 */

const CalorieForm: React.FC<CalorieFormProps> = ({ setToast, darkMode }) => {
  const [form, setForm] = useState<{ dish_name: string; servings: number }>({ dish_name: '', servings: 1 });
  const [result, setResult] = useState<CalorieResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mealLog, setMealLog] = useState<CalorieResult[]>([]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    const parsed = calorieSchema.safeParse(form);
    if (!parsed.success) {
      setToast({ type: 'error', message: 'Please enter a valid dish and servings.' });
      setTimeout(() => setToast(null), 3000);
      return;
    }
    setLoading(true);
    try {
      const data = await api('/get-calories', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setResult(data);
      setToast({ type: 'success', message: 'Calories fetched successfully!' });
      setTimeout(() => setToast(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Could not fetch calories');
      setToast({ type: 'error', message: err.message || 'Could not fetch calories' });
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
      <div className={styles.card + " card mt-5 shadow-lg border-0 rounded-4 p-3 p-md-4 mx-2 mx-md-auto"} style={{ maxWidth: 480, width: '100%', background: darkMode ? '#18181b' : '#fff' }}>
        <form onSubmit={submit} className={styles.form}>
          <h2 className="font-weight-bold text-gradient text-primary mb-1">Calorie Lookup</h2>
          {error && <div className={styles.error}>{error}</div>}
          <Autocomplete
            suggestions={dishSuggestions}
            value={form.dish_name}
            onChange={val => setForm(f => ({ ...f, dish_name: val }))}
            placeholder="Dish Name"
            disabled={loading}
            darkMode={darkMode}
          />
          <input
            className="form-control"
            type="number"
            min={1}
            placeholder="Servings"
            value={form.servings}
            onChange={e => setForm(f => ({ ...f, servings: Number(e.target.value) }))}
            required
            disabled={loading}
          />
          <button type="submit" disabled={loading} className={"btn btn-lg btn-primary w-100 text-white shadow-sm mt-2"} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {loading ? <><Spinner size={22} color="#fff" /> <span>Loading...</span></> : 'Get Calories'}
          </button>
        </form>
        {result && !loading && (
          <div className="card mt-4 shadow-lg border-0 rounded-4 p-4 text-center" style={{ maxWidth: 400, width: '100%', margin: '0 auto', background: darkMode ? '#18181b' : '#fff', color: darkMode ? '#fff' : '#18181b' }}>
            <div className="font-weight-bold text-gradient text-primary mb-2" style={{ fontSize: '1.5rem', fontWeight: 700 }}>{result.dish_name}</div>
            <div className="mb-2">Servings: <span className="font-weight-bold">{result.servings}</span></div>
            <div className="mb-2">Calories per serving: <span className="font-weight-bold">{result.calories_per_serving}</span></div>
            <div className="mb-2">Total calories: <span className="font-weight-bold">{result.total_calories}</span></div>
            <div className="text-xs text-secondary mt-2">Source: {result.source}</div>
            <button
              className="btn btn-success btn-sm mt-3"
              style={{ background: darkMode ? '#363671' : undefined, color: '#fff', border: 'none' }}
              onClick={() => {
                setMealLog(log => [result, ...log]);
                setToast({ type: 'success', message: 'Meal logged!' });
                setTimeout(() => setToast(null), 2000);
              }}
            >Log Meal</button>
          </div>
        )}
        {/* Meal Log/History */}
        {mealLog.length > 0 && (
          <div className="card mt-4 shadow-lg border-0 rounded-4 p-4" style={{ maxWidth: 400, width: '100%', margin: '0 auto', background: darkMode ? '#23234b' : '#f8fafc', color: darkMode ? '#e0e7ff' : '#18181b' }}>
            <h4 className="mb-3" style={{ fontWeight: 700, color: darkMode ? '#fff' : undefined }}>Meal Log</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: 200, overflowY: 'auto' }}>
              {mealLog.map((meal, idx) => (
                <li key={idx} style={{ borderBottom: '1px solid #4441', padding: '0.5rem 0' }}>
                  <div style={{ fontWeight: 600 }}>{meal.dish_name} <span style={{ fontWeight: 400, fontSize: 13, color: darkMode ? '#a5b4fc' : '#6366f1' }}>({meal.servings} serving{meal.servings > 1 ? 's' : ''})</span></div>
                  <div style={{ fontSize: 13 }}>Total: <b>{meal.total_calories}</b> kcal</div>
                  <div style={{ fontSize: 11, color: darkMode ? '#a5b4fc' : '#6366f1' }}>{meal.source}</div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalorieForm;
