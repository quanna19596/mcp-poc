import { z } from "zod";

export default z.object({
  doc_id: z.string().describe("Id of the document to read"),
});
