import express from 'express'
import dotenv from 'dotenv'
dotenv.config()
import { ChatGoogle } from "@langchain/google";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";



const app = express()

const port = process.env.PORT || 5000

// set model
const model = new ChatGoogle("gemini-3.5-flash-lite")

// creates Google Gemini Embeddings
const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "gemini-embedding-001", // 768 dimensions
  taskType: TaskType.RETRIEVAL_DOCUMENT,
  title: "Document title",
});

app.listen(port,()=>{
    console.log(`server is running on port : ${port}`)
})