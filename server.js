import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ OFFICIAL GOOGLE CLIENT (NO v1beta ISSUE)
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// GET → HTML
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// POST → CHAT
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    // 🔧 SIMPLE TOOL LOGIC (same as agent)
    if (message.toLowerCase().includes("breakfast")) {
      return res.json({ reply: "🍳 Aloo Paratha, Poha, Masala Chai" });
    }
    if (message.toLowerCase().includes("lunch")) {
      return res.json({
        reply: "🍛 Paneer Butter Masala, Dal Fry, Jeera Rice, Roti",
      });
    }
    if (message.toLowerCase().includes("dinner")) {
      return res.json({ reply: "🍽 Veg Biryani, Raita, Salad, Gulab Jamun" });
    }

    // fallback → Gemini
    const result = await model.generateContent(message);
    res.json({ reply: result.response.text() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "❌ AI Error" });
  }
});

app.listen(3000, () =>
  console.log("✅ Server running at http://localhost:3000")
);
