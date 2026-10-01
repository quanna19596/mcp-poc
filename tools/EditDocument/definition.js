export default {
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
};
