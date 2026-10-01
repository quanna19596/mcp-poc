import Schema from "./schema.js";
import docs from "../../data/docs.js";

export default (request) => {
  const args = Schema.parse(request.params.arguments);

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
};
