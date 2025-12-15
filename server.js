import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

dotenv.config();

const app = express();
app.use(express.json());

// fix __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ===============================
   1️⃣ MODEL (Gemini)
================================ */
const model = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-flash",
  temperature: 0.5,
  apiKey: process.env.GOOGLE_API_KEY,
});

/* ===============================
   2️⃣ TOOL (getMenuTool)
================================ */
const getMenuTool = new DynamicStructuredTool({
  name: "get_menu",
  description: "Returns today's menu for breakfast, lunch, or dinner",
  schema: z.object({
    category: z.string(),
  }),
  func: async ({ category }) => {
    const menus = {
      breakfast: "Aloo Paratha, Poha, Masala Chai",
      lunch: "Paneer Butter Masala, Dal Fry, Jeera Rice, Roti",
      dinner: "Veg Biryani, Raita, Salad, Gulab Jamun",
    };
    return menus[category.toLowerCase()] || "No menu found";
  },
});

/* ===============================
   3️⃣ AGENT (THIS IS THE KEY 🔥)
   (YouTube equivalent)
================================ */
const agent = model.bindTools([getMenuTool]);

/* ===============================
   4️⃣ GET ROUTE – Serve HTML
================================ */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* ===============================
   5️⃣ POST ROUTE – CHAT
================================ */
app.post("/api/chat", async (req, res) => {
  try {
    const userInput = req.body.message;

    const response = await agent.invoke(userInput);

    res.json({
      reply: response.content,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Something went wrong" });
  }
});

/* ===============================
   6️⃣ SERVER START
================================ */
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
