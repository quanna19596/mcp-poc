import Schema from "./schema.js";
import docs from "../../data/docs.js";

export default (request) => {
  const args = Schema.parse(request.params.arguments);

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
};
