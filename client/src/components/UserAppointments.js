import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/UserAppointments.css';

function UserAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await axios.get('/api/appointments');
        setAppointments(response.data);
      } catch (err) {
        setError('Failed to fetch appointments');
      }
    };
    fetchAppointments();
  }, []);

  return (
    <div className="user-appointments">
      <h2>My Appointments</h2>
      {error && <div className="error-message">{error}</div>}
      {appointments.length === 0 ? (
        <p>No appointments scheduled</p>
      ) : (
        <div className="appointments-list">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="appointment-card">
              <div className="appointment-header">
                <h3>Appointment with {appointment.doctor_name}</h3>
                <span className={`status ${appointment.status}`}>
                  {appointment.status}
                </span>
              </div>
              <div className="appointment-details">
                <p><strong>Date:</strong> {new Date(appointment.date).toLocaleDateString()}</p>
                <p><strong>Time:</strong> {appointment.time}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UserAppointments;
