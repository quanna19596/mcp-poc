import { z } from "zod";

export default z.object({
  doc_id: z.string().describe("Id of the document that will be edited"),
  old_str: z
    .string()
    .describe("The text to replace. Must match exactly, including whitespace"),
  new_str: z
    .string()
    .describe("The new text to insert in place of the old text."),
});
