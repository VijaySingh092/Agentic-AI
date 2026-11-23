import express from 'express'
import dotenv from 'dotenv'
dotenv.config()
import { ChatGoogle } from "@langchain/google";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import { QdrantVectorStore } from "@langchain/qdrant";
import fs from 'fs'
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import {PDFParse} from  "pdf-parse"

const app = express()

const port = process.env.PORT || 5000

// set model
const model = new ChatGoogle("gemini-3.5-flash-lite")

// creates Google Gemini Embeddings
const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "gemini-embedding-001", // 768 dimensions
});

// Initialize Qdrant vector store using Gemini embeddings
const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
  url: process.env.QDRANT_URL,
  apiKey:process.env.QDRANT_API_KEY,
  collectionName: "synopsis",
});

const upload = async()=>{
    const path='./synopsis-interviewAI.pdf'
    const buffer= fs.readFileSync(path)    // buffer stores the PDF's raw binary && readFileSync() reads the complete PDF file.data.  At this stage, Node.js has the PDF's data, but it hasn't extracted the readable text.
    // Creates a PDF parser instance and supplies the Buffer to it
    const pdfResult = new PDFParse({data:buffer})  // Creates a PDF parser instance and supplies the Buffer to it
    const result = await pdfResult.getText()  // processes the binary data and extracts readable text
    const text = result.text  //  extracts the readable text from the result object and stores it in a variable named text

    // takes the extracted PDF text and divides it into smaller pieces called chunks
    const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 100, chunkOverlap: 1 })  // creating an instance of RecursiveCharacterTextSplitter
    const docs = await splitter.createDocuments([text]) // splits your extracted text into smaller documents.
    await vectorStore.addDocuments(docs)  // converts their text into embedding vectors 
}

upload()

app.listen(port,()=>{
    console.log(`server is running on port : ${port}`)
})