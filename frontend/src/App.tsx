import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import CalorieForm from './components/CalorieForm';
import { useAuthStore } from './stores/authStore';
import styles from './components/App.module.scss';
import Hamburger from './components/Hamburger';

const App: React.FC = () => {
  const { isLoggedIn, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    document.body.className = darkMode ? styles.dark : '';
  }, [darkMode, styles.dark]);

  const handleLogout = () => {
    logout();
    setToast({ type: 'success', message: 'You have been logged out.' });
    setTimeout(() => setToast(null), 3000);
    navigate('/login');
  };

  useEffect(() => {
    // Only protect /calories route
    if (!isLoggedIn && location.pathname === '/calories') {
      navigate('/login');
    }
  }, [isLoggedIn, navigate, location]);

  return (
    <div className={darkMode ? `${styles.dark} ${styles.app}` : styles.app}>
      <header style={{ background: darkMode ? '#23234b' : '#ffffff', transition: 'background 0.3s' }}>
        <nav className="navbar navbar-main navbar-expand-lg px-0 mx-3 shadow-none border-radius-xl" id="navbarBlur" data-scroll="true">
          <div className="container-fluid py-1 px-3 d-flex align-items-center justify-content-between">
            <Link to="/" className="navbar-brand d-flex align-items-center gap-2 p-0 m-0">
              <img
                src={darkMode ? "/material-dashboard-master/assets/img/logo-ct.png" : "/material-dashboard-master/assets/img/logo-ct-dark.png"}
                alt="logo"
                width={32}
                height={32}
                style={{ borderRadius: 8, background: 'transparent' }}
              />
              <span
                className="ms-2 text-lg font-weight-bold header-options"
                style={{ color: darkMode ? '#e0e7ff' : '#212121', transition: 'color 0.3s' }}
              >
                Meal Calorie Counter
              </span>
            </Link>
            {/* Hamburger for mobile */}
            <div className={styles.hamburgerWrap}>
              <Hamburger onClick={() => setNavOpen(o => !o)} isOpen={navOpen} />
            </div>
            {/* Nav links for desktop and mobile */}
            <ul
              className={`navbar-nav align-items-center gap-3 mb-0 ${styles.responsiveNav} ${navOpen ? styles.navOpen : ''}`}
            >
              <li className="nav-item">
                <Link
                  to="/register"
                  className="nav-link"
                  style={{ color: darkMode ? '#e0e7ff' : '#212121', transition: 'color 0.3s' }}
                  onClick={() => setNavOpen(false)}
                >
                  Register
                </Link>
              </li>
              {!isLoggedIn ? (
                <li className="nav-item">
                  <Link
                    to="/login"
                    className="nav-link"
                    style={{ color: darkMode ? '#e0e7ff' : '#212121', transition: 'color 0.3s' }}
                    onClick={() => setNavOpen(false)}
                  >
                    Login
                  </Link>
                </li>
              ) : (
                <>
                  <li className="nav-item">
                    <Link
                      to="/calories"
                      className="nav-link"
                      style={{ color: darkMode ? '#e0e7ff' : '#212121', transition: 'color 0.3s' }}
                      onClick={() => setNavOpen(false)}
                    >
                      Get Calories
                    </Link>
                  </li>
                  <li className="nav-item">
                    <span
                      className="nav-link"
                      style={{ color: darkMode ? '#f87171' : '#e53935', cursor: 'pointer', transition: 'color 0.3s' }}
                      onClick={() => { setNavOpen(false); handleLogout(); }}
                    >
                      Logout
                    </span>
                  </li>
                </>
              )}
              <li className="nav-item">
                <button className={darkMode ? styles.darkButton : styles.button} onClick={() => { setDarkMode(d => !d); setNavOpen(false); }}>
                  {darkMode ? '🌙 Dark' : '☀️ Light'}
                </button>
              </li>
            </ul>
          </div>
        </nav>
      </header>
      <main
        className={styles.main}
        style={{
          minHeight: '100vh',
          width: '100vw',
          background: `url('${darkMode ? '/health-bg-dark.svg' : '/health-bg.svg'}') center center / cover no-repeat fixed`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/register" element={<RegisterForm darkMode={darkMode} setToast={setToast} />} />
          <Route path="/login" element={<LoginForm darkMode={darkMode} setToast={setToast} />} />
          <Route path="/calories" element={<CalorieForm darkMode={darkMode} setToast={setToast} />} />
        </Routes>
      </main>
      {toast && (
        <div className={styles['material-toast']}>
          <div className={`alert ${toast.type === 'error' ? 'alert-danger' : 'alert-success'} d-flex align-items-center`} role="alert">
            <span style={{ flex: 1 }}>{toast.message}</span>
            <button className="btn-close" aria-label="Close" onClick={() => setToast(null)}></button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
