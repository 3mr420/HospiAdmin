import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';

function Home() {
  const doctors = [
    { id: 1, name: 'Dr. Sarah Johnson', specialization: 'Cardiologist' },
    { id: 2, name: 'Dr. Michael Chen', specialization: 'Pediatrician' },
    { id: 3, name: 'Dr. Emily Williams', specialization: 'Dermatologist' },
    { id: 4, name: 'Dr. James Wilson', specialization: 'Neurologist' },
    { id: 5, name: 'Dr. Lisa Anderson', specialization: 'Family Medicine' }
  ];

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to HospiAdmin</h1>
          <p>Your trusted platform for medical appointment booking</p>
          <Link to="/book-appointment" className="cta-button">Book Appointment</Link>
        </div>
      </section>

      <section className="features">
        <h2>Why Choose HospiAdmin?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <i className="fas fa-calendar-check"></i>
            <h3>Easy Booking</h3>
            <p>Book appointments with just a few clicks</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-user-md"></i>
            <h3>Expert Doctors</h3>
            <p>Access to qualified healthcare professionals</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-clock"></i>
            <h3>24/7 Support</h3>
            <p>Round-the-clock customer service</p>
          </div>
        </div>
      </section>

      <section className="doctors">
        <h2>Our Medical Experts</h2>
        <div className="doctors-grid">
          {doctors.map(doctor => (
            <div key={doctor.id} className="doctor-card">
              <div className="doctor-avatar">
                <i className="fas fa-user-md"></i>
              </div>
              <h3>{doctor.name}</h3>
              <p>{doctor.specialization}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cta">
        <div className="cta-content">
          <h2>Ready to Book Your Appointment?</h2>
          <p>Join thousands of satisfied patients who trust HospiAdmin</p>
          <Link to="/register" className="cta-button">Get Started</Link>
        </div>
      </section>
    </div>
  );
}

export default Home;
