import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pkg from "pg";
import bodyParser from "body-parser";
import apiRouter from "./routes/api.js";
import { body, validationResult } from "express-validator";
import path from "path";

dotenv.config();
const { Pool } = pkg;

const app = express();

// ✅ Middleware (Should be before routes)
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// ✅ Attach API Routes (Fix order)
app.use("/api", apiRouter);

// ✅ Default route for root URL "/"
app.get("/", (req, res) => {
  res.send("🚀 Backend is running! Use /api/... for API requests.");
});

// ✅ Test Route (To check if backend is working)
app.get("/api/test", (req, res) => {
  res.json({ message: "API is working!" });
}); 

// ✅ Register User
app.post(
  "/api/auth/register",
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
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// ✅ Start Express Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
