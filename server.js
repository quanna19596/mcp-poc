import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

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

const docs = {
  "deposition.md": "This deposition covers the testimony of Angela Smith, P.E.",
  "report.pdf": "The report details the state of a 20m condenser tower.",
  "financials.docx":
    "These financials outline the project's budget and expenditures.",
  "outlook.pdf":
    "This document presents the projected future performance of the system.",
  "plan.md": "The plan outlines the steps for the project's implementation.",
  "spec.txt":
    "These specifications define the technical requirements for the equipment.",
};

const ReadDocSchema = z.object({
  doc_id: z.string().describe("Id of the document to read"),
});

const EditDocSchema = z.object({
  doc_id: z.string().describe("Id of the document that will be edited"),
  old_str: z
    .string()
    .describe("The text to replace. Must match exactly, including whitespace"),
  new_str: z
    .string()
    .describe("The new text to insert in place of the old text."),
});

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "read_doc_contents",
        description:
          "Read the contents of a document and return it as a string.",
        inputSchema: {
          type: "object",
          properties: {
            doc_id: {
              type: "string",
              description: "Id of the document to read",
            },
          },
          required: ["doc_id"],
        },
      },
      {
        name: "edit_document",
        description:
          "Edit a document by replacing a string in the documents content with a new string.",
        inputSchema: {
          type: "object",
          properties: {
            doc_id: {
              type: "string",
              description: "Id of the document that will be edited",
            },
            old_str: {
              type: "string",
              description:
                "The text to replace. Must match exactly, including whitespace",
            },
            new_str: {
              type: "string",
              description: "The new text to insert in place of the old text.",
            },
          },
          required: ["doc_id", "old_str", "new_str"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "read_doc_contents") {
    const args = ReadDocSchema.parse(request.params.arguments);

    if (!(args.doc_id in docs)) {
      throw new Error(`Doc with id ${args.doc_id} not found`);
    }

    return {
      content: [
        {
          type: "text",
          text: docs[args.doc_id],
        },
      ],
    };
  }

  if (request.params.name === "edit_document") {
    const args = EditDocSchema.parse(request.params.arguments);

    if (!(args.doc_id in docs)) {
      throw new Error(`Doc with id ${args.doc_id} not found`);
    }

    docs[args.doc_id] = docs[args.doc_id].replace(args.old_str, args.new_str);

    return {
      content: [
        {
          type: "text",
          text: `Successfully edited document ${args.doc_id}`,
        },
      ],
    };
  }

  throw new Error("Tool không được hỗ trợ");
});

async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("DocumentMCP server is running...");
}

run().catch(console.error);
