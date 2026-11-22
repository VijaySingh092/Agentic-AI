import express from 'express'
import dotenv from 'dotenv'
dotenv.config()
import * as z from "zod"
import { tool } from "langchain"
import { TavilySearch } from "@langchain/tavily";
import { ChatGoogle } from "@langchain/google";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { MessagesAnnotation, StateGraph } from '@langchain/langgraph'
import { MongoClient } from "mongodb";
import { MongoDBSaver } from "@langchain/langgraph-checkpoint-mongodb";


const app = express()

const port = process.env.PORT || 5000

app.use(express.json());

// checkpointer backed by database
const client = new MongoClient(process.env.MONGO_URI)
const checkpointer = new MongoDBSaver({ client });


//  build in tool serch tool
const tool1 = new TavilySearch({
  maxResults: 5,
  topic: "general",
});


// create custom tool
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

// create tools array
const tools = [tool1, tool2]


 // set model and bind Tools
const model = new ChatGoogle("gemini-3.5-flash-lite").bindTools(tools)


// create toolNode = responsible for executing the tool calls
const toolNode = new ToolNode(tools)  


// agentNode : calls model
const agent = async (state)=>{                
   const result = await model.invoke(
    state.messages
   )
   return {
    messages:[result]
   }
}  



const shouldContinue=(state)=>{
     console.log(state)

    // Gets the latest message from the conversation.Because Gemini's latest response determines what should happen next.
    const lastMessage = state.messages[state.messages.length - 1];

    if(lastMessage.tool_calls.length>0){       // // Checks whether Gemini has requested any tools
        return "tool_node"
    }else{
        return "_end_"
    }
}


// create graph  with build-in state
// MessagesAnnotation is a predefined state structure provided by LangGraph that manages conversation messages in your graph.

const graph = new StateGraph(MessagesAnnotation)
.addNode("agent",agent)
.addNode("tool_node",toolNode)
.addEdge("__start__","agent")
.addConditionalEdges("agent",shouldContinue)   // After the agent node finishes executing, call the shouldContinue function
.addEdge("tool_node","agent")
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