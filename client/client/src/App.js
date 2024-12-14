import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import BookAppointment from './components/BookAppointment';
import AdminPortal from './components/AdminPortal';
import ContactUs from './components/ContactUs';
import UserAppointments from './components/UserAppointments';
import './styles/App.css';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const token = Cookies.get('token');
  const role = Cookies.get('role');
  
  console.log('Protected Route Check:', {
    hasToken: !!token,
    userRole: role,
    requiresAdmin: adminOnly
  });

  if (!token) {
    console.log('No token found, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && role !== 'admin') {
    console.log('Admin access required, user is not admin');
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/book-appointment" 
            element={
              <ProtectedRoute>
                <BookAppointment />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminPortal />
              </ProtectedRoute>
            }
          />
          <Route path="/contact" element={<ContactUs />} />
          <Route 
            path="/my-appointments" 
            element={
              <ProtectedRoute>
                <UserAppointments />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
