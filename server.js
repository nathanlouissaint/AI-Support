import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import "./config/db.js";
import { handleChat } from "./controllers/chatController.js";

dotenv.config();

const app = express();

// ======================
// MIDDLEWARE
// ======================
app.use(cors());
app.use(express.json());

// ======================
// ROUTES
// ======================
app.post("/chat", handleChat);

// Health check (important for Render)
app.get("/", (req, res) => {
  res.json({ status: "server alive" });
});

// ======================
// PORT CONFIG (CRITICAL FIX)
// ======================
const PORT = process.env.PORT || 8000;

// ======================
// START SERVER
// ======================
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});