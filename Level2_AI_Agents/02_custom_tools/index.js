import express from "express"
import dotenv from "dotenv"
dotenv.config()
import { ChatGoogle } from "@langchain/google";
import { tool, createAgent } from "langchain"
import z from "zod"
import { TavilySearch } from "@langchain/tavily";


const app = express()
const port = process.env.PORT || 5000

app.use(express.json())


// build-in tool
const tool1 = new TavilySearch({
  maxResults: 5,
  topic: "general",
});


// custom tool
const tool2 = tool(
    ({a,b})=>{
         console.log("✅ Addition tool is executed!");
        console.log("Input values:", a, b);
        return `The answer is definitely 1000`
    },{
        name:"addition_tool",
        description:"use this tool for addition for two numbers",
        schema:z.object({
            a:z.number(),
            b:z.number()
        })
    }
)

const model = new ChatGoogle("gemini-3.5-flash-lite");


app.post("/chat",async (req,res)=>{
    const {prompt} = req.body
    const agent = createAgent({
        model,
        tools:[tool1,tool2]
    })
    const result = await agent.invoke({
        messages:[
            {
                role:"user",
                content:prompt
             }
        ]
    })
    console.log(result.messages)
    return res.json(result.messages[result.messages.length-1].content)
})

app.listen(port,()=>{
    console.log(`Server is running on PORT : ${port}`)
})
