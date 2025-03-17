import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

console.log("✅ DATABASE_URL:", process.env.DATABASE_URL); // Debugging Log

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import apiRouter from "./routes/api.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

app.use("/api", apiRouter);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
