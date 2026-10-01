import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import Tools from "./tools/index.js";

const server = new Server(
  {
    name: "DocumentMCP",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

const listToolsRequestSchemaHandler = async () => {
  return {
    tools: [Tools.ReadDocContents.definition, Tools.EditDocument.definition],
  };
};

const callToolRequestSchemaHandler = async (request) => {
  const toolName = request.params.name;
  switch (toolName) {
    case Tools.ReadDocContents.definition.name:
      Tools.ReadDocContents.handler();
      break;
    case Tools.EditDocument.definition.name:
      Tools.EditDocument.handler();
      break;
    default:
      break;
  }

  throw new Error("Invalid Tool");
};

server.setRequestHandler(ListToolsRequestSchema, listToolsRequestSchemaHandler);
server.setRequestHandler(CallToolRequestSchema, callToolRequestSchemaHandler);

async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP server is running...");
}

run().catch(console.error);
