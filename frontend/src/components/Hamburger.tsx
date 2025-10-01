import React from 'react';

interface HamburgerProps {
  onClick: () => void;
  isOpen: boolean;
}

const Hamburger: React.FC<HamburgerProps> = ({ onClick, isOpen }) => (
  <button
    aria-label="Open navigation menu"
    onClick={onClick}
    className="navbar-toggler shadow-none ms-2"
    type="button"
    style={{
      border: 'none',
      background: 'transparent',
      padding: 0,
      width: 40,
      height: 40,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100,
    }}
  >
    <span className="navbar-toggler-icon" style={{
      width: 28,
      height: 28,
      display: 'inline-block',
      background: 'none',
      position: 'relative',
    }}>
      <span style={{
        display: 'block',
        position: 'absolute',
        width: 28,
        height: 3,
        background: '#6366f1',
        borderRadius: 2,
        top: isOpen ? 13 : 6,
        left: 0,
        transition: '0.3s',
        transform: isOpen ? 'rotate(45deg)' : 'none',
      }} />
      <span style={{
        display: 'block',
        position: 'absolute',
        width: 28,
        height: 3,
        background: '#6366f1',
        borderRadius: 2,
        top: 13,
        left: 0,
        opacity: isOpen ? 0 : 1,
        transition: '0.3s',
      }} />
      <span style={{
        display: 'block',
        position: 'absolute',
        width: 28,
        height: 3,
        background: '#6366f1',
        borderRadius: 2,
        top: isOpen ? 13 : 20,
        left: 0,
        transition: '0.3s',
        transform: isOpen ? 'rotate(-45deg)' : 'none',
      }} />
    </span>
  </button>
);

export default Hamburger;
