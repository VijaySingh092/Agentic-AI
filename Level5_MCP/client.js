import express from 'express'
import dotenv from 'dotenv'
dotenv.config()
import { ChatGoogle } from "@langchain/google";
import { Client } from "@modelcontextprotocol/client";   // 	Creates an MCP client to communicate with an MCP server.
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";


const app = express()

app.use(express.json())

const port = process.env.PORT || 5000

// Initializing the Gemini model
const model_name = "gemini-3.5-flash-lite"
const model = new ChatGoogle(model_name)

// Creating the MCP client
const client = new Client({
    name:"client",
    version:"1.0.0"
})

//  This function removes incompatible properties.
function cleanSchema(schema) {
    const cleaned = { ...schema }  // Creates a shallow copy of the schema object.

    // Removing unsupported properties
    delete cleaned.$schema
    delete cleaned.$id
    delete cleaned.additionalProperties

    // Cleaning nested properties
    if (cleaned.properties) {
        for (const key in cleaned.properties) {
            cleaned.properties[key] = cleanSchema(
                cleaned.properties[key]
            )
        }
    }

    // Cleaning array items : If the schema contains an array, it cleans the schema describing the array elements.
    if (cleaned.items) {
        cleaned.items = cleanSchema(cleaned.items)
    }

    return cleaned   // Returns the modified schema.
}

// function that initializes the MCP connection and starts your Express server.
async function start(params) {

    // Creating the MCP transport
    const transport  = new StdioClientTransport({  // It establishes communication between your MCP client and MCP server using:
        command: process.execPath,  // It returns the path of the currently running Node.js executable.  The purpose of process.execPath is to find the Node.js executable so your application can start another Node.js process without hardcoding the Node.js installation path.
        args:["server.js"]  // It tells Node.js which file to execute.
    })

    await client.connect(transport) // his establishes the connection between your MCP client and MCP server.

     // StdioClientTransport prepares the server process.
    //  client.connect() establishes the MCP connection.
   //   The client and server can now exchange MCP messages.

    const tools = await client.listTools() // Fetching available tools
    
    // Binding MCP tools to Gemini
    const modelWithTools = model.bindTools([
       { 
        functionDeclarations: tools.tools.map(tool=>({
                name:tool.name,
                description: tool.description,
                parameters: cleanSchema(tool.inputSchema)
        }))
    }
    ])
    

    // creating chat api
    app.post('/chat', async (req,res)=>{

     const {prompt} = req.body
    
     const response = await modelWithTools.invoke([
        {
            role:"human",
            content:prompt
        }
    ])

    if(response.tool_calls.length){    // Checking whether Gemini requested a tool
        const tool = response.tool_calls[0]  // This extracts the first tool call requested by Gemini.
        const result = await client.callTool({  // Executing the MCP tool
            name:tool.name,
            arguments:tool.args
        })

        return res.json(result.content[0].text)  // extracts the text from the MCP server's response and sends it to the frontend.
    }

    return res.json(response.content)  // Handling normal Gemini responses when tool is not called

} )

app.listen(port, ()=>{
   console.log( `Server is running on port : ${port}`)
})

}

start()
