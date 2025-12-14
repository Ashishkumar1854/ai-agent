import express from "express";
import dotenv from "dotenv";

// LangChain v1 imports
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { AgentExecutor, createToolCallingAgent } from "@langchain/core/agents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { DynamicStructuredTool } from "@langchain/core/tools";

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
