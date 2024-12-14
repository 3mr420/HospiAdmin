# HospiAdmin - Hospital Management System

A modern web application for managing hospital appointments, patients, and administrative tasks.

## Features

- **User Authentication**
  - Secure login system for patients and administrators
  - Role-based access control

- **Appointment Management**
  - Book appointments with doctors
  - View and manage appointment status
  - Real-time updates

- **Patient Management**
  - Patient registration
  - View patient history
  - Track appointments

- **Admin Dashboard**
  - Comprehensive appointment overview
  - Patient management interface
  - Status updates

## Technology Stack

- **Frontend**
  - React.js
  - Axios for API calls
  - Modern CSS with responsive design

- **Backend**
  - Node.js
  - Express.js
  - SQLite3 database
  - JWT authentication

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/hospiadmin.git
   ```

2. Install backend dependencies:
   ```bash
   cd hospiadmin
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd client
   npm install
   ```

4. Create a .env file in the root directory (optional):
   ```
   PORT=5000
   JWT_SECRET=your_jwt_secret
   ```

## Running the Application

1. Start the backend server:
   ```bash
   npm start
   ```

2. Start the frontend development server:
   ```bash
   cd client
   npm start
   ```

3. Access the application at `http://localhost:3000`

## Default Admin Account

- Username: admin
- Password: admin123

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
