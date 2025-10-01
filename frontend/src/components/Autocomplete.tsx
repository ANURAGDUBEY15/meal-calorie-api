import React, { useState, useRef, useEffect } from 'react';

interface AutocompleteProps {
  suggestions: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  darkMode?: boolean;
}

const Autocomplete: React.FC<AutocompleteProps> = ({ suggestions, value, onChange, placeholder, disabled, darkMode }) => {
  const [show, setShow] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShow(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filtered = value
    ? suggestions.filter(s => s.toLowerCase().includes(value.toLowerCase()))
    : suggestions;

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      <input
        className="form-control"
        type="text"
        value={value}
        onChange={e => { onChange(e.target.value); setShow(true); setHighlight(-1); }}
        onFocus={() => setShow(true)}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
      />
      {show && filtered.length > 0 && (
        <ul style={{
          position: 'absolute',
          zIndex: 1000,
          left: 0,
          right: 0,
          background: darkMode ? '#23234b' : '#fff',
          color: darkMode ? '#fff' : '#18181b',
          border: darkMode ? '1px solid #363671' : '1px solid #e5e7eb',
          borderRadius: 8,
          margin: 0,
          padding: 0,
          listStyle: 'none',
          maxHeight: 180,
          overflowY: 'auto',
          boxShadow: '0 4px 24px 0 rgba(0,0,0,0.10)',
        }}>
          {filtered.map((s, i) => (
            <li
              key={s}
              style={{
                padding: '0.5rem 1rem',
                background: i === highlight ? (darkMode ? '#363671' : '#e0e7ff') : 'transparent',
                color: darkMode ? '#fff' : '#18181b',
                cursor: 'pointer',
                fontWeight: i === highlight ? 600 : 400,
              }}
              onMouseDown={() => { onChange(s); setShow(false); }}
              onMouseEnter={() => setHighlight(i)}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Autocomplete;
