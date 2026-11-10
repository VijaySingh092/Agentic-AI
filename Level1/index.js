import express from 'express'
import dotenv from 'dotenv'
dotenv.config()
import { GoogleGenAI } from "@google/genai";

const app = express()

const PORT = process.env.PORT || 5000

const ai = new GoogleGenAI({
    apiKey:process.env.GEMINI_API_KEY
});

const main = async()=>{
   
    const interaction = await ai.interactions.create({
  model: "gemini-3.5-flash-lite",
  input: "Hi , whats is agentic ai",
});
console.log(interaction.output_text);
}
main()

app.listen(PORT,()=>{
    console.log(`server is running on PORT ${PORT}`)
})