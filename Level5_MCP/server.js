import { McpServer } from "@modelcontextprotocol/server";  // McpServer allows you to create an MCP server

import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";   // Imports the standard input/output (stdio) transport

import { z } from "zod";  // Imports Zod, a JavaScript schema validation library.

// Creating an MCP server
const server = new McpServer({
    title:"calculator",    // Name of your MCP server
    version:"1.0.0"        // Version of your server
})

// Registering a tool
server.registerTool(   //  registers a new tool with the MCP server
    "addition",   // tool's unique name. MCP client uses this name to identify and call the tool.

    {          // Tool configuration This defines the tool's metadata and input structure
        description:"for adding two numbers",
        inputSchema:z.object({
            a:z.number(),
            b:z.number()
        })
    },

    // Callback function: This is the function executed when the MCP client calls the addition tool.
    async ({a,b})=>{
        return {
            content:[   // Contains the tool's response
                {
                    type:"text",   // Specifies that the response is text
                    text:`sum using this mcp tool is ${a} & ${b} = ${a+b}` // Contains the actual result.
                }
            ]
        }
    }
)

// Creating the transport : This creates a communication channel between your MCP server and an MCP client
const transport = new StdioServerTransport()

// Connecting the server
server.connect(transport)