import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/BookAppointment.css';

function BookAppointment() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get('/api/doctors');
        setDoctors(response.data);
      } catch (err) {
        setError('Failed to fetch doctors');
      }
    };
    fetchDoctors();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/appointments', {
        doctor_id: selectedDoctor,
        date: selectedDate,
        time: selectedTime
      });
      setSuccess('Appointment booked successfully!');
      setError('');
      // Reset form
      setSelectedDoctor('');
      setSelectedDate('');
      setSelectedTime('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to book appointment');
      setSuccess('');
    }
  };

  // Get tomorrow's date as minimum date for booking
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="book-appointment">
      <h2>Book an Appointment</h2>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Select Doctor:</label>
          <select
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
            required
          >
            <option value="">Choose a doctor</option>
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.name} - {doctor.specialization}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Select Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={minDate}
            required
          />
        </div>

        <div className="form-group">
          <label>Select Time:</label>
          <select
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            required
          >
            <option value="">Choose a time</option>
            {timeSlots.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="submit-button">Book Appointment</button>
      </form>
    </div>
  );
}

export default BookAppointment;
