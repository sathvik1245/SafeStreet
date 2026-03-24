import React, { useEffect, useState, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';
import { account } from './appwriteConfig';
import { AuthContext } from '../AuthContext'; 

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setIsLoggedIn } = useContext(AuthContext); 
  const [show, setShow] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(window.scrollY);

  useEffect(() => {
    if (location.pathname !== '/dashboard') return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setShow(false);
      } else {
        setShow(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, location.pathname]);

  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggedIn(false);
      navigate('/login');
    }
  };

  const isDashboard = location.pathname === '/dashboard';
  const isProfile = location.pathname === '/profile';

  return (
    <nav className={`navbar ${show ? 'show' : 'hide'}`}>
      <h1>Safe Street</h1>
      <div className="nav-links">
        {isDashboard && (
          <>
            <Link to="/profile" className="nav-button">Profile</Link>
            <button className="nav-button" onClick={handleLogout}>Logout</button>
          </>
        )}
        {isProfile && (
          <>
            <Link to="/dashboard" className="nav-button">Dashboard</Link>
            <button className="nav-button" onClick={handleLogout}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
