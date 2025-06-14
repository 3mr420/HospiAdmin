const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const db_access = require("./Db.js");
const db = db_access.db;
const cookieParser = require("cookie-parser");
const server = express();
const port = 555;
const secret_key = "HospitalManagementSecretKey2025";

server.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
server.use(express.json());
server.use(cookieParser());

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, secret_key, { expiresIn: "1h" });
};

const verifyToken = (req, res, next) => {
  const token = req.cookies.authToken;
  if (!token) {
    console.log("Here problem!!");
    return res.status(401).send("unauthorized");
  }
  jwt.verify(token, secret_key, (err, details) => {
    if (err) {
      console.log("Token verification failed:", err.message);
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    req.userDetails = details;
    next();
  });
};


server.post("/user/register", (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      return res.status(500).send("error hashing password");
    }
    db.run(
      `INSERT INTO ACCOUNTS (name, email, password, role) VALUES (?, ?, ?, ?)`,
      [name, email, hashedPassword, "user"],
      (err) => {
        if (err) {
          return res.status(401).send(err.message);
        } else return res.status(200).send("Registration successful");
      }
    );
  });
});


server.post("/user/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  db.get(`SELECT * FROM ACCOUNTS WHERE EMAIL = ? `, [email], (err, row) => {
    if (err || !row) {
      return res.status(401).send("Invalid credentials");
    }
    bcrypt.compare(password, row.PASSWORD, (err, isMatch) => {
      if (err || !isMatch) {
        return res.status(401).send("Invalid credentials");
      }
      const token = generateToken(row.ID, row.ROLE);
      res.cookie("authToken", token, {
        httpOnly: true,
        secure: true,
        maxAge: 60 * 60 * 1000,
      });
      return res
        .status(200)
        .json({ id: row.ID, role: row.ROLE, name: row.NAME });
    });
  });
});


server.post("/doctor/add", verifyToken, (req, res) => {
  if (req.userDetails.role !== "admin") {
    console.log(
      "Access denied: User role is",
      req.userDetails.role,
      "but admin required"
    );
    return res
      .status(403)
      .json({ error: "Access denied: Admin role required" });
  }

  const { name, email, password, specialty, yearsOfExperience } = req.body;

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      return res.status(500).send("Error hashing password");
    }

    
    db.run(
      `INSERT INTO ACCOUNTS (name, email, password, role) VALUES (?, ?, ?, ?)`,
      [name, email, hashedPassword, "doctor"],
      function (err) {
        if (err) {
          return res.status(400).send(err.message);
        }

        const accountId = this.lastID;

       
        db.run(
          `INSERT INTO DOCTOR_PROFILES (account_id, specialty, years_of_experience) VALUES (?, ?, ?)`,
          [accountId, specialty, yearsOfExperience],
          (err) => {
            if (err) {
              return res.status(400).send(err.message);
            }
            return res.status(200).send("Doctor added successfully");
          }
        );
      }
    );
  });
});


server.post("/doctor/schedule", verifyToken, (req, res) => {
  if (req.userDetails.role !== "admin") {
    return res.status(403).send("you are not admin.");
  }

  const { doctorAccountId, appointmentDate, startTime, endTime } = req.body;

  db.run(
    `INSERT INTO SCHEDULES (doctor_account_id, appointment_date, start_time, end_time) 
            VALUES (?, ?, ?, ?)`,
    [doctorAccountId, appointmentDate, startTime, endTime],
    (err) => {
      if (err) {
        return res.status(400).send(err.message);
      }
      return res.status(200).send("Schedule added successfully");
    }
  );
});


server.get("/doctors", (req, res) => {
  db.all(
    `SELECT a.ID, a.NAME, a.EMAIL, dp.SPECIALTY, dp.YEARS_OF_EXPERIENCE 
            FROM ACCOUNTS a 
            JOIN DOCTOR_PROFILES dp ON a.ID = dp.ACCOUNT_ID 
            WHERE a.ROLE = 'doctor'`,
    (err, rows) => {
      if (err) {
        return res.status(500).send(err.message);
      }
      return res.json(rows);
    }
  );
});


server.get("/doctor/schedules/:doctorId", (req, res) => {
  const doctorId = req.params.doctorId;
  db.all(
    `SELECT * FROM SCHEDULES WHERE DOCTOR_ACCOUNT_ID = ? ORDER BY APPOINTMENT_DATE, START_TIME`,
    [doctorId],
    (err, rows) => {
      if (err) {
        return res.status(500).send(err.message);
      }
      return res.json(rows);
    }
  );
});


server.post("/booking/create", verifyToken, (req, res) => {
  if (req.userDetails.role !== "user") {
    return res.status(403).send("you are not patient.");
  }

  const { scheduleId } = req.body;
  const userId = req.userDetails.id;

  
  db.get(
    `SELECT * FROM BOOKINGS WHERE SCHEDULE_ID = ?`,
    [scheduleId],
    (err, existingBooking) => {
      if (err) {
        return res.status(500).send(err.message);
      }

      if (existingBooking) {
        return res.status(400).send("This appointment slot is already booked");
      }

    
      db.run(
        `INSERT INTO BOOKINGS (user_account_id, schedule_id, status) VALUES (?, ?, ?)`,
        [userId, scheduleId, "Pending"],
        (err) => {
          if (err) {
            return res.status(400).send(err.message);
          }
          return res.status(200).send("Booking created successfully");
        }
      );
    }
  );
});


server.get("/user/bookings", verifyToken, (req, res) => {
  if (req.userDetails.role !== "user") {
    return res.status(403).send("you are not patient.");
  }

  const userId = req.userDetails.id;
  db.all(
    `SELECT b.*, s.APPOINTMENT_DATE, s.START_TIME, s.END_TIME, 
            d.NAME as doctor_name, dp.SPECIALTY
            FROM BOOKINGS b 
            JOIN SCHEDULES s ON b.SCHEDULE_ID = s.ID 
            JOIN ACCOUNTS d ON s.DOCTOR_ACCOUNT_ID = d.ID 
            JOIN DOCTOR_PROFILES dp ON d.ID = dp.ACCOUNT_ID
            WHERE b.USER_ACCOUNT_ID = ? 
            ORDER BY s.APPOINTMENT_DATE, s.START_TIME`,
    [userId],
    (err, rows) => {
      if (err) {
        return res.status(500).send(err.message);
      }
      return res.json(rows);
    }
  );
});


server.get("/doctor/bookings", verifyToken, (req, res) => {
  if (req.userDetails.role !== "doctor") {
    return res.status(403).send("you are not doctor.");
  }

  const doctorId = req.userDetails.id;
  db.all(
    `SELECT b.*, s.APPOINTMENT_DATE, s.START_TIME, s.END_TIME, 
            u.NAME as patient_name
            FROM BOOKINGS b 
            JOIN SCHEDULES s ON b.SCHEDULE_ID = s.ID 
            JOIN ACCOUNTS u ON b.USER_ACCOUNT_ID = u.ID 
            WHERE s.DOCTOR_ACCOUNT_ID = ? 
            ORDER BY s.APPOINTMENT_DATE, s.START_TIME`,
    [doctorId],
    (err, rows) => {
      if (err) {
        return res.status(500).send(err.message);
      }
      return res.json(rows);
    }
  );
});


server.put("/booking/status/:id", verifyToken, (req, res) => {
  if (req.userDetails.role !== "admin") {
    return res.status(403).send("you are not admin.");
  }

  const { status } = req.body;
  const bookingId = req.params.id;

  db.run(
    `UPDATE BOOKINGS SET STATUS = ? WHERE ID = ?`,
    [status, bookingId],
    (err) => {
      if (err) {
        return res.status(400).send(err.message);
      }
      return res.status(200).send("Booking status updated successfully");
    }
  );
});


server.get("/admin/bookings", verifyToken, (req, res) => {
  if (req.userDetails.role !== "admin") {
    return res.status(403).send("you are not admin.");
  }

  db.all(
    `SELECT b.*, s.APPOINTMENT_DATE, s.START_TIME, s.END_TIME, 
            u.NAME as patient_name, d.NAME as doctor_name, dp.SPECIALTY
            FROM BOOKINGS b 
            JOIN SCHEDULES s ON b.SCHEDULE_ID = s.ID 
            JOIN ACCOUNTS u ON b.USER_ACCOUNT_ID = u.ID 
            JOIN ACCOUNTS d ON s.DOCTOR_ACCOUNT_ID = d.ID 
            LEFT JOIN DOCTOR_PROFILES dp ON d.ID = dp.ACCOUNT_ID
            ORDER BY s.APPOINTMENT_DATE, s.START_TIME`,
    (err, rows) => {
      if (err) {
        return res.status(500).send(err.message);
      }
      return res.json(rows);
    }
  );
});


server.get("/schedules/available", (req, res) => {
  db.all(
    `SELECT s.*, d.NAME as doctor_name, dp.SPECIALTY
            FROM SCHEDULES s 
            JOIN ACCOUNTS d ON s.DOCTOR_ACCOUNT_ID = d.ID 
            LEFT JOIN DOCTOR_PROFILES dp ON d.ID = dp.ACCOUNT_ID
            WHERE s.ID NOT IN (SELECT SCHEDULE_ID FROM BOOKINGS)
            ORDER BY s.APPOINTMENT_DATE, s.START_TIME`,
    (err, rows) => {
      if (err) {
        return res.status(500).send(err.message);
      }
      return res.json(rows);
    }
  );
});


server.post("/logout", (req, res) => {
  res.clearCookie("authToken");
  return res.status(200).send("Logged out successfully");
});

server.listen(port, () => {
  console.log(`Hospital management server started at port ${port}`);
  db.serialize(() => {
    db.run(db_access.createAccountsTable, (err) => {
      if (err) console.log("error creating accounts table " + err);
    });
    db.run(db_access.createDoctorProfilesTable, (err) => {
      if (err) console.log("error creating doctor profiles table " + err);
    });
    db.run(db_access.createSchedulesTable, (err) => {
      if (err) console.log("error creating schedules table " + err);
    });
    db.run(db_access.createBookingsTable, (err) => {
      if (err) console.log("error creating bookings table " + err);
    });
  });
});
