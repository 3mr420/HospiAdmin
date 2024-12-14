const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cookieParser = require('cookie-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(cookieParser());

// Database setup
const db = new sqlite3.Database('./hospital.db', (err) => {
    if (err) {
        console.error('Error connecting to database:', err);
    } else {
        console.log('Connected to SQLite database');
        createTables();
    }
});

// Create tables
function createTables() {
    db.serialize(() => {
        console.log('Starting database initialization...');
        
        // Drop existing tables
        db.run("DROP TABLE IF EXISTS appointments");
        db.run("DROP TABLE IF EXISTS users");
        db.run("DROP TABLE IF EXISTS doctors");

        // Users table (for both patients and admins)
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT,
            name TEXT,
            role TEXT,
            phone TEXT
        )`, (err) => {
            if (err) {
                console.error('Error creating users table:', err);
            } else {
                console.log('Users table created successfully');
                
                // Create admin user
                const adminPassword = bcrypt.hashSync('admin123', 10);
                db.run(`INSERT INTO users (username, password, name, role, phone) 
                        VALUES (?, ?, ?, ?, ?)`,
                    ['admin', adminPassword, 'Admin User', 'admin', '1234567890'],
                    function(err) {
                        if (err) {
                            console.error('Error creating admin user:', err);
                        } else {
                            console.log('Admin user created successfully');
                        }
                    });
            }
        });

        // Doctors table
        db.run(`CREATE TABLE IF NOT EXISTS doctors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            specialization TEXT,
            image_url TEXT
        )`, (err) => {
            if (err) {
                console.error('Error creating doctors table:', err);
            } else {
                console.log('Doctors table created successfully');
                
                // Insert sample doctors
                const doctors = [
                    ['Dr. Sarah Johnson', 'Cardiologist', '/images/doctor1.jpg'],
                    ['Dr. Michael Chen', 'Pediatrician', '/images/doctor2.jpg'],
                    ['Dr. Emily Williams', 'Dermatologist', '/images/doctor3.jpg'],
                    ['Dr. James Wilson', 'Neurologist', '/images/doctor4.jpg'],
                    ['Dr. Lisa Anderson', 'Family Medicine', '/images/doctor5.jpg']
                ];

                doctors.forEach(doctor => {
                    db.run('INSERT INTO doctors (name, specialization, image_url) VALUES (?, ?, ?)',
                        doctor,
                        function(err) {
                            if (err) {
                                console.error('Error inserting doctor:', err);
                            } else {
                                console.log('Doctor inserted:', doctor[0]);
                            }
                        });
                });
            }
        });

        // Appointments table
        db.run(`CREATE TABLE IF NOT EXISTS appointments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id INTEGER,
            doctor_id INTEGER,
            date TEXT,
            time TEXT,
            status TEXT DEFAULT 'scheduled',
            FOREIGN KEY(patient_id) REFERENCES users(id),
            FOREIGN KEY(doctor_id) REFERENCES doctors(id)
        )`, (err) => {
            if (err) {
                console.error('Error creating appointments table:', err);
            } else {
                console.log('Appointments table created successfully');
            }
        });
    });
}

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Access denied' });

    jwt.verify(token, 'your_jwt_secret', (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
};

// Routes
app.post('/api/register', async (req, res) => {
    const { username, password, name, phone } = req.body;
    console.log('Registering new user:', { username, name, phone });
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.run('INSERT INTO users (username, password, name, role, phone) VALUES (?, ?, ?, ?, ?)',
        [username, hashedPassword, name, 'patient', phone],
        function(err) {
            if (err) {
                console.error('Registration error:', err);
                return res.status(400).json({ error: 'Username already exists' });
            }
            console.log('User registered successfully:', username);
            res.json({ message: 'Registration successful' });
        });
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    console.log('Login attempt for username:', username);
    
    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
        if (err) {
            console.error('Database error during login:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        
        if (!user) {
            console.log('User not found:', username);
            return res.status(400).json({ error: 'User not found' });
        }

        try {
            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                console.log('Invalid password for user:', username);
                return res.status(400).json({ error: 'Invalid password' });
            }

            const token = jwt.sign({ id: user.id, role: user.role }, 'your_jwt_secret');
            console.log('Login successful for user:', username, 'with role:', user.role);
            
            res.cookie('token', token, { 
                httpOnly: false,
                secure: false,
                sameSite: 'lax',
                path: '/',
                maxAge: 24 * 60 * 60 * 1000
            });

            res.cookie('role', user.role, {
                httpOnly: false,
                secure: false,
                sameSite: 'lax',
                path: '/',
                maxAge: 24 * 60 * 60 * 1000
            });

            res.json({ 
                success: true,
                role: user.role,
                message: 'Login successful'
            });
        } catch (error) {
            console.error('Error during password comparison:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
});

app.get('/api/doctors', authenticateToken, (req, res) => {
    db.all('SELECT * FROM doctors', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

app.post('/api/appointments', authenticateToken, (req, res) => {
    const { doctor_id, date, time } = req.body;
    const patient_id = req.user.id;

    db.run('INSERT INTO appointments (patient_id, doctor_id, date, time, status) VALUES (?, ?, ?, ?, ?)',
        [patient_id, doctor_id, date, time, 'scheduled'],
        function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ id: this.lastID });
        });
});

// Update appointment status
app.put('/api/appointments/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['scheduled', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    db.run(
        'UPDATE appointments SET status = ? WHERE id = ?',
        [status, id],
        function(err) {
            if (err) {
                console.error('Error updating appointment:', err);
                return res.status(500).json({ error: 'Failed to update appointment' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Appointment not found' });
            }
            res.json({ message: 'Appointment updated successfully' });
        }
    );
});

app.get('/api/appointments', authenticateToken, (req, res) => {
    const query = req.user.role === 'admin' 
        ? `SELECT a.*, u.name as patient_name, d.name as doctor_name 
           FROM appointments a 
           JOIN users u ON a.patient_id = u.id 
           JOIN doctors d ON a.doctor_id = d.id`
        : `SELECT a.*, d.name as doctor_name 
           FROM appointments a 
           JOIN doctors d ON a.doctor_id = d.id 
           WHERE a.patient_id = ?`;
    
    const params = req.user.role === 'admin' ? [] : [req.user.id];
    
    db.all(query, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Get all patients (admin only)
app.get('/api/patients', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }

    db.all(
        `SELECT id, username, name, phone, role,
        (SELECT COUNT(*) FROM appointments WHERE patient_id = users.id) as appointment_count
        FROM users
        WHERE role = 'patient'`,
        [],
        (err, rows) => {
            if (err) {
                console.error('Error fetching patients:', err);
                return res.status(500).json({ error: 'Failed to fetch patients' });
            }
            res.json(rows);
        }
    );
});

// Get patient details with appointment history
app.get('/api/patients/:id', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;
    
    db.get('SELECT id, username, name, phone FROM users WHERE id = ? AND role = ?', 
        [id, 'patient'],
        (err, patient) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to fetch patient details' });
            }
            if (!patient) {
                return res.status(404).json({ error: 'Patient not found' });
            }

            db.all(
                `SELECT a.*, d.name as doctor_name
                FROM appointments a
                JOIN doctors d ON a.doctor_id = d.id
                WHERE a.patient_id = ?
                ORDER BY a.date DESC, a.time DESC`,
                [id],
                (err, appointments) => {
                    if (err) {
                        return res.status(500).json({ error: 'Failed to fetch appointment history' });
                    }
                    res.json({
                        ...patient,
                        appointments
                    });
                }
            );
        }
    );
});

app.post('/api/logout', (req, res) => {
    res.clearCookie('token');
    res.clearCookie('role');
    res.json({ message: 'Logged out successfully' });
});

// Add a test route to verify database content
app.get('/api/test/users', (req, res) => {
    db.all('SELECT id, username, role, name FROM users', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
