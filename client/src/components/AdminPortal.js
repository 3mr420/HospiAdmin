import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/AdminPortal.css';

function AdminPortal() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('appointments');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'appointments') {
      fetchAppointments();
    } else if (activeTab === 'patients') {
      fetchPatients();
    }
  }, [activeTab]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/appointments', {
        withCredentials: true
      });
      setAppointments(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch appointments');
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/patients', {
        withCredentials: true
      });
      setPatients(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch patients');
      console.error('Error fetching patients:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      setLoading(true);
      await axios.put(
        `http://localhost:5000/api/appointments/${appointmentId}`,
        { status: newStatus },
        { withCredentials: true }
      );
      await fetchAppointments();
      setError('');
    } catch (err) {
      setError('Failed to update appointment status');
      console.error('Error updating appointment:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePatientClick = async (patientId) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/patients/${patientId}`, {
        withCredentials: true
      });
      setSelectedPatient(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch patient details');
      console.error('Error fetching patient details:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-portal">
      <h2>Admin Portal</h2>
      <div className="admin-tabs">
        <button
          className={activeTab === 'appointments' ? 'active' : ''}
          onClick={() => {
            setActiveTab('appointments');
            setSelectedPatient(null);
          }}
        >
          Appointments
        </button>
        <button
          className={activeTab === 'patients' ? 'active' : ''}
          onClick={() => {
            setActiveTab('patients');
            setSelectedPatient(null);
          }}
        >
          Patients
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {loading && <div className="loading">Loading...</div>}

      {activeTab === 'appointments' && (
        <div className="appointments-section">
          <h3>Appointments</h3>
          <div className="appointments-table">
            <table>
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Doctor</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => (
                  <tr key={appointment.id} className={`status-${appointment.status}`}>
                    <td>{appointment.patient_name}</td>
                    <td>{appointment.doctor_name}</td>
                    <td>{new Date(appointment.date).toLocaleDateString()}</td>
                    <td>{appointment.time}</td>
                    <td>{appointment.status}</td>
                    <td>
                      <select
                        value={appointment.status}
                        onChange={(e) => handleStatusChange(appointment.id, e.target.value)}
                        className="status-select"
                      >
                        <option value="scheduled">Scheduled</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'patients' && (
        <div className="patients-section">
          {!selectedPatient ? (
            <>
              <h3>Patients</h3>
              <div className="patients-table">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Username</th>
                      <th>Phone</th>
                      <th>Total Appointments</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map((patient) => (
                      <tr key={patient.id}>
                        <td>{patient.name}</td>
                        <td>{patient.username}</td>
                        <td>{patient.phone}</td>
                        <td>{patient.appointment_count}</td>
                        <td>
                          <button
                            onClick={() => handlePatientClick(patient.id)}
                            className="view-details-btn"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="patient-details">
              <button
                onClick={() => setSelectedPatient(null)}
                className="back-btn"
              >
                ← Back to Patients
              </button>
              <h3>Patient Details</h3>
              <div className="patient-info">
                <p><strong>Name:</strong> {selectedPatient.name}</p>
                <p><strong>Username:</strong> {selectedPatient.username}</p>
                <p><strong>Phone:</strong> {selectedPatient.phone}</p>
              </div>
              <h4>Appointment History</h4>
              <div className="patient-appointments">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Doctor</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPatient.appointments.map((appointment) => (
                      <tr key={appointment.id} className={`status-${appointment.status}`}>
                        <td>{new Date(appointment.date).toLocaleDateString()}</td>
                        <td>{appointment.time}</td>
                        <td>{appointment.doctor_name}</td>
                        <td>{appointment.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminPortal;
