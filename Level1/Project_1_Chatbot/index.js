import express from 'express'
import dotenv from 'dotenv'
dotenv.config()
import { GoogleGenAI } from "@google/genai";

const app = express()

const port = process.env.PORT ||5000

const ai = new GoogleGenAI({
    apiKey:process.env.GEMINI_API_KEY
});

app.use(express.json())

app.post("/chat",async(req,res)=>{
    const {prompt} = req.body
    const result = await ai.interactions.create({
                model: "gemini-3.5-flash-lite",
                 input: prompt,
                });

                return res.json(result.output_text)
            })


app.listen(port,()=>{
    console.log(`server is running on PORT ${port}`)
})