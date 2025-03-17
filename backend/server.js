import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pkg from "pg";
import bodyParser from "body-parser";
import apiRouter from "./routes/api.js";
import path from "path";

dotenv.config();
const { Pool } = pkg;

const app = express();

// ✅ Middleware (Should be before routes)
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// ✅ PostgreSQL Database Connection (Fix Port)
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: 5432, // ✅ FIXED: PostgreSQL default port is 5432
});

// ✅ Default route for root URL "/"
app.get("/", (req, res) => {
  res.send("🚀 Backend is running! Use /api/... for API requests.");
});

// ✅ Test Route (To check if backend is working)
app.get("/api/test", (req, res) => {
  res.json({ message: "API is working!" });
});

// ✅ Attach API Routes (Fix order)
app.use("/api", apiRouter);


// ✅ Start Express Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
