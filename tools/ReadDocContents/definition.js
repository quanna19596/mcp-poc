export default {
  name: "read_doc_contents",
  description: "Read the contents of a document and return it as a string.",
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
};
