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

// ✅ Allow All Methods (Fix for 405 Error)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200); // Allow preflight requests
  }
  next();
});

// ✅ Load API Router
try {
  const { default: apiRouter } = await import("./routes/api.js");
  console.log("✅ api.js is successfully imported!");

  // ✅ Attach API Routes
  app.use("/api", apiRouter);
} catch (error) {
  console.error("❌ ERROR: Unable to load api.js", error);
}

// ✅ Log Available Routes in Express
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
