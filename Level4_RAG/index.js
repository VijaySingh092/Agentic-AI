import express from 'express'
import dotenv from 'dotenv'
dotenv.config()
import { ChatGoogle } from "@langchain/google";


const app = express()

const port = process.env.PORT || 5000

// set model
const model = new ChatGoogle("gemini-3.5-flash-lite")

app.listen(port,()=>{
    console.log(`server is running on port : ${port}`)
})