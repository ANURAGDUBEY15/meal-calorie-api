import React from 'react';

const Spinner: React.FC<{ size?: number; color?: string }> = ({ size = 22, color = '#fff' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 50 50"
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
    aria-label="Loading"
  >
    <circle
      cx="25"
      cy="25"
      r="20"
      fill="none"
      stroke={color}
      strokeWidth="5"
      strokeDasharray="31.4 31.4"
      strokeLinecap="round"
      transform="rotate(-90 25 25)"
    >
      <animateTransform
        attributeName="transform"
        type="rotate"
        from="0 25 25"
        to="360 25 25"
        dur="0.8s"
        repeatCount="indefinite"
      />
    </circle>
  </svg>
);

export default Spinner;
