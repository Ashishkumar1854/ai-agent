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

// 🔑 __dirname fix for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Gemini model
const model = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-flash",
  temperature: 0.5,
  apiKey: process.env.GOOGLE_API_KEY,
});

// Tool (same as YouTube)
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

// 🔥 Agent equivalent (Gemini tool calling)
const agent = model.bindTools([getMenuTool]);

// ✅ GET route (HTML serve) — SAME AS YOUTUBE
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// POST route (chat)
app.post("/chat", async (req, res) => {
  const { message } = req.body;
  const result = await agent.invoke(message);

  res.json({
    reply: result.content,
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
