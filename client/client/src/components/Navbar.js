import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import '../styles/Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const isLoggedIn = Cookies.get('token');
  const userRole = Cookies.get('role');

  const handleLogout = () => {
    Cookies.remove('token');
    Cookies.remove('role');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="logo">
          <i className="fas fa-hospital-alt"></i>
          <span>HospiAdmin</span>
        </Link>
      </div>
      <div className="navbar-right">
        {!isLoggedIn ? (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        ) : (
          <>
            <Link to="/book-appointment">Book Appointment</Link>
            <Link to="/my-appointments">My Appointments</Link>
            {userRole === 'admin' && (
              <Link to="/admin">Admin Portal</Link>
            )}
            <Link to="/contact">Contact Us</Link>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
