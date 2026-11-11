import express from 'express'
import dotenv from 'dotenv'
dotenv.config()
import { ChatGoogle } from "@langchain/google";

const app = express()

const port = process.env.PORT || 5000

app.use(express.json())

app.post('/chat',async (req,res)=>{
    const {prompt} = req.body
    // const model = new ChatGoogle("gemini-3.5-flash-lite");
    const model = new ChatGoogle({
        model:"gemini-3.5-flash-lite",
        temperature:0.7,
        maxOutputTokens:100
    });
    
    // const result = await model.invoke(prompt);
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
})


app.listen(port, ()=>{
    console.log(`server is running on PORT ${port}`)
})