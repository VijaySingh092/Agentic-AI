import { McpServer } from "@modelcontextprotocol/server";  // McpServer allows you to create an MCP server

import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";   // Imports the standard input/output (stdio) transport

import { z } from "zod";  // Imports Zod, a JavaScript schema validation library.

// Creating an MCP server
const server = new McpServer({
    title:"calculator",    // Name of your MCP server
    version:"1.0.0"        // Version of your server
})

// Creating the transport : This creates a communication channel between your MCP server and an MCP client
const transport = new StdioServerTransport()

// Connecting the server
server.connect(transport)