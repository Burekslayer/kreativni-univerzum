import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pkg from "pg";
import bodyParser from "body-parser";
import apiRouter from "./routes/api.js";

dotenv.config();

const { Pool } = pkg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // ✅ Required for Railway PostgreSQL
});

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// ✅ Attach API Routes
app.use("/api", apiRouter);

// ✅ Default Route
app.get("/", (req, res) => {
  res.send("🚀 Backend is running! Use /api/... for API requests.");
});

// ✅ Export pool (Fixes the Import Issue)
export { pool };

// ✅ Start Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
