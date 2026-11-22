import express from 'express'
import dotenv from 'dotenv'
dotenv.config()
import * as z from "zod"
import { tool } from "langchain"
import { TavilySearch } from "@langchain/tavily";
import { ChatGoogle } from "@langchain/google";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { MessagesAnnotation, StateGraph, StateSchema } from '@langchain/langgraph'
import { MongoClient } from "mongodb";
import { MongoDBSaver } from "@langchain/langgraph-checkpoint-mongodb";


const app = express()

const port = process.env.PORT || 5000

app.use(express.json());

// checkpointer backed by database
const client = new MongoClient(process.env.MONGO_URI)
const checkpointer = new MongoDBSaver({ client });


 // set model and bind Tools
const model = new ChatGoogle("gemini-3.5-flash-lite")

// create custom state
const customState = new StateSchema({
    prompt:z.string(),
    approvalRequires:z.boolean(),
    aiResponse:z.string(),
    approved:z.boolean(),
    result:z.string()
})

// agentNode : calls model
const agent = async (state)=>{                
   const result = await model.invoke(
    state.messages
   )
   return {
    messages:[result]
   }
}  

const approvalNode = async(state)=>{

}

const actionNode  = async(state)=>{

}

const shouldContinue= async(state)=>{
    if(state.approvalRequires){
        return "approval"
    }else "__end__"
}


// create graph  with custom state
const graph = new StateGraph(customState)
.addNode("agent",agent)
.addNode("approval",approvalNode)
.addNode("action",actionNode)
.addEdge("__start__","agent")
.addConditionalEdges("agent",shouldContinue)   // After the agent node finishes executing, call the shouldContinue function
.addEdge("approval","action")
.addEdge("action","__end__")
.compile({checkpointer})

app.post("/chat", async (req,res)=>{
    const {prompt} = req.body

    const result = await graph.invoke({
        messages:[
            {
                role:"user",
                content:prompt
            }
        ]
    },
{
    configurable:{thread_id:"user-1"}
}
)

    console.log(result.messages[result.messages.length-1].content)
    return res.json(result.messages[result.messages.length-1].content)
})


app.listen(port,()=>{
    console.log(`Server is running on port : ${port}`)
})