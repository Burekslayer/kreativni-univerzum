import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";

dotenv.config();
const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// ✅ Load API Router Manually
try {
  const { default: apiRouter } = await import("./routes/api.js");
  console.log("✅ api.js is successfully imported!");

  // ✅ Manually Attach Each Route
  app.post("/api/auth/login", (req, res) => {
    res.json({ message: "Manual Login Route Works!" });
  });

  app.post("/api/auth/register", (req, res) => {
    res.json({ message: "Manual Register Route Works!" });
  });

  app.get("/api/test", (req, res) => {
    res.json({ message: "API Test Route Works!" });
  });

} catch (error) {
  console.error("❌ ERROR: Unable to load api.js", error);
}

// ✅ Debugging: Log Available Routes
setTimeout(() => {
  console.log("✅ Available Routes in Express:");
  app._router.stack.forEach((r) => {
    if (r.route && r.route.path) {
      console.log(`➡ ${r.route.path} (${Object.keys(r.route.methods)})`);
    }
  });
}, 2000);

// ✅ Start Express Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
