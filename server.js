import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import "./config/db.js";
import { handleChat } from "./controllers/chatController.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.post("/chat", handleChat);

// Health check
app.get("/", (req, res) => {
  res.json({ status: "server alive" });
});

// Start server
app.listen(8000, "127.0.0.1", () => {
  console.log("🚀 Server running on http://127.0.0.1:8000");
});