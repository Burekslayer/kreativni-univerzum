import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";

import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: "postgresql://postgres:sSNsJujEvbviRZwjuftDFgGPrCJmdIoi@switchback.proxy.rlwy.net:13056/railway?sslmode=require",
  ssl: {
    rejectUnauthorized: false
  }
});

console.log("✅ Using HARD-CODED public Railway URL");



const apiRouter = express.Router();

// ✅ Debugging Log - Check if `api.js` is even being loaded
console.log("✅ api.js is loaded!");

// ✅ Test Route
apiRouter.get("/test", (req, res) => {
  console.log("✅ Test Route Hit!");
  res.json({ message: "API is working!" });
});

// ✅ Debugging Log - Check if routes are added
setTimeout(() => {
  console.log("✅ Routes inside apiRouter:");
  console.log(apiRouter.stack.map((route) => route.route?.path));
}, 1000);

// ✅ Register User
apiRouter.post("/auth/register", async (req, res) => {
  const { name, email, password } = req.body;
  console.log("✅ Register Route Hit!");
  console.log("➡ Received Data:", { name, email, password });

  try {
    // Check if user already exists
    const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    console.log("✅ User Exists Query Executed");

    if (userExists.rows.length > 0) {
      console.log("❌ User already exists");
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log("✅ Password Hashed:", hashedPassword);

    // Insert User
    console.log("🔹 Inserting user into database...");
    const newUser = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
      [name, email, hashedPassword]
    );
    console.log("✅ User successfully inserted into database");

    // Generate JWT Token
    const token = jwt.sign({ id: newUser.rows[0].id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    console.log("✅ JWT Token Generated");

    res.status(201).json({ token, user: newUser.rows[0] });
  } catch (err) {
    console.error("❌ Error in Register API:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

  

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
