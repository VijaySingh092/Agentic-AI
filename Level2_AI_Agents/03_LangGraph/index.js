import express from "express"
import dotenv from 'dotenv'
dotenv.config()
import { ChatGoogle } from "@langchain/google";
import { TavilySearch } from "@langchain/tavily";
import { tool, createAgent } from "langchain"
import z from 'zod'
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { MessagesAnnotation, StateGraph } from "@langchain/langgraph";

const app = express()

app.use(express.json())

const tool1 = new TavilySearch({
  maxResults: 5,
  topic: "general",
});

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

const port = process.env.PORT || 5000

const tools =[tool1, tool2] // tools array

const model = new ChatGoogle("gemini-3.5-flash-lite").bindTools(tools)

const toolNode = new ToolNode(tools)  // ToolNode


// state=[
//     humanMessage:"",
//     AIMessage:"",
//     toolMessage:"",
//     AiMessages:""
// ]

const agent = async (state)=>{                // agentNode : calls model
   const result = await model.invoke(
    state.messages
   )

   return {
    messages:[result]
   }

}  

const shouldContinue=(state)=>{
    console.log(state)
    if(state.messages[state.messages.length-1].tool_calls.length>0){
        return "tool_node"
    }else{
        return "_end_"
    }
}


// create graph  with build-in state
const graph = new StateGraph(MessagesAnnotation)
.addNode("agent",agent)
.addNode("tool_node",toolNode)
.addEdge("__start__","agent")
.addConditionalEdges("agent",shouldContinue)
.addEdge("tool_node","agent")
.compile()

app.post("/chat", async (req,res)=>{
    const {prompt} = req.body

    const result = await graph.invoke({
        messages:[
            {
                role:"user",
                content:prompt
            }
        ]
    })

    console.log(result.messages[result.messages.length-1].content)
    return res.json(result.messages[result.messages.length-1].content)
})


app.listen(port,()=>{
    console.log(`Server is running on port: ${port}`)
})