import express from "express";
import dotenv from "dotenv";

// LangChain v1 imports
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { AgentExecutor, createToolCallingAgent } from "@langchain/core/agents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

// Gemini model
const model = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-flash",
  temperature: 0.5,
  apiKey: process.env.GOOGLE_API_KEY,
});

// Tool
const getMenuTool = new DynamicStructuredTool({
  name: "getMenuTool",
  description:
    "Returns the final answer for today's menu for the given category (breakfast, lunch, or dinner). Use this tool to directly answer the user's menu question.",
  schema: z.object({
    category: z
      .string()
      .describe("Type of food. Example: breakfast, lunch, dinner"),
  }),
  func: async ({ category }) => {
    const menus = {
      breakfast: "Allo paratha, Poha, Masala Chai",
      lunch: "Paneer Butter Masala, Dal Fry, Jeera Rice, Roti",
      dinner: "Veg Biryani, raita, Salad, Gulab jamun",
    };
    return menus[category.toLowerCase()] || "No menu found for that category.";
  },
});

//prompt
const prompt = ChatPromptTemplate.fromMessages([
  ["system", "you are a helpful assistant that uses tools when needed."],
  ["human", "{input}"],
  ["ai", "{agent_scratchpad}"],
]);

// Agent
const agent = await createToolCallingAgent({
  llm: model,
  tools: [getMenuTool],
  prompt,
});

// Executor
const executor = await AgentExecutor.fromAgentTools({
  agent,
  tools: [getMenuTool],
});

const app = express();

//middleware
app.use(express.json());

//test route
app.get("/", (req, res) => {
  return res.send("server running successfull..");
});

//port
const PORT = process.env.PORT || 3000;
//server start
app.listen(PORT, () =>
  console.log(`server is running on https://localhost:${PORT}`)
);
