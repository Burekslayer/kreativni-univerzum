import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import pkg from "pg";

const apiRouter = express.Router();

// ✅ Use the existing database connection from `server.js`
import { pool } from "../server.js"; // ✅ FIX: Import pool instead of creating a new one

// ✅ Register User
apiRouter.post(
  "/auth/register",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password } = req.body;

    try {
      // Check if user exists
      const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
      if (userExists.rows.length > 0) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Insert user into database
      const newUser = await pool.query(
        "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
        [name, email, hashedPassword]
      );

      // Generate JWT Token
      const token = jwt.sign({ id: newUser.rows[0].id }, process.env.JWT_SECRET, { expiresIn: "1h" });

      res.status(201).json({ token, user: newUser.rows[0] });
    } catch (err) {
      console.error("❌ Error in Register API:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// ✅ Login User
apiRouter.post(
  "/auth/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;

    try {
      const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
      if (user.rows.length === 0) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(password, user.rows[0].password);
      if (!validPassword) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET, { expiresIn: "1h" });

      res.json({ token, user: { id: user.rows[0].id, name: user.rows[0].name, email: user.rows[0].email } });
    } catch (err) {
      console.error("❌ Error in Login API:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

export default apiRouter;
