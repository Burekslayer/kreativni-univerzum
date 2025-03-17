import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pkg from "pg";
import bodyParser from "body-parser";
import apiRouter from "./routes/api.js";
import path from "path";

dotenv.config();

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// ✅ Attach API Routes
app.use("/api", apiRouter);

// ✅ Test Root API
app.get("/", (req, res) => {
  res.send("🚀 Backend is running! Use /api/... for API requests.");
});

// ✅ Test API Availability
app.get("/api/test", (req, res) => {
  res.json({ message: "API is working!" });
});

// ✅ Log All Routes (For Debugging)
app._router.stack.forEach((r) => {
  if (r.route && r.route.path) {
    console.log(`✅ Route available: ${r.route.path}`);
  }
});

// ✅ Prevent Frontend From Overriding API Routes
app.all("/api/*", (req, res) => {
  res.status(404).json({ message: "API route not found" });
});

// ✅ Start Express Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
