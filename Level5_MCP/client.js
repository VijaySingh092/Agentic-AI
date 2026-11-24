import express from 'express'
import dotenv from 'dotenv'
dotenv.config()
import { ChatGoogle } from "@langchain/google";
import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";


const app = express()

app.use(express.json())

const port = process.env.PORT || 5000

const model_name = "gemini-3.5-flash-lite"
const model = new ChatGoogle(model_name)



app.post('/chat', async (req,res)=>{

     const {prompt} = req.body
    
     const result = await model.invoke([
        {
            role:"system",
            content:"you are jarvis and my assistant"
        },
        {
            role:"human",
            content:prompt
        }
    ]);

    return res.json(result.content)
} )

app.listen(port, ()=>{
   console.log( `Server is running on port : ${port}`)
})