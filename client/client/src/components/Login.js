import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import '../styles/Auth.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      console.log('Attempting login with username:', username);
      
      const response = await axios.post('http://localhost:5000/api/login', {
        username,
        password
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Login response:', response.data);

      // Wait a moment for cookies to be set
      setTimeout(() => {
        // Check if cookies were set
        const role = Cookies.get('role');
        console.log('Role cookie after login:', role);

        if (!role) {
          throw new Error('Failed to set authentication cookies');
        }

        // Navigate based on role
        if (role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/book-appointment');
        }
      }, 100);

    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.error || 
        err.message || 
        'Login failed. Please try again.'
      );
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Login to HospiAdmin</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="auth-button">Login</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
