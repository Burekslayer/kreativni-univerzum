import express from "express";

const app = express();

// ✅ Test Route
app.get("/test", (req, res) => {
  res.json({ message: "Minimal Express Server on Railway is working!" });
});

// ✅ Start Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`🚀 Minimal Server running on Railway port ${PORT}`));
