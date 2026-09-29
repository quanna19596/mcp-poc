import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import {
  ListToolsResultSchema,
  CallToolResultSchema,
} from "@modelcontextprotocol/sdk/types.js";

const transport = new StdioClientTransport({
  command: "node",
  args: ["server.js"],
});

const client = new Client(
  {
    name: "MyMCPClient",
    version: "1.0.0",
  },
  {
    capabilities: {},
  },
);

async function listTools() {
  const response = await client.request(
    { method: "tools/list" },
    ListToolsResultSchema,
  );
  return response.tools;
}

async function callTool(toolName, toolInput) {
  const result = await client.request(
    {
      method: "tools/call",
      params: {
        name: toolName,
        arguments: toolInput,
      },
    },
    CallToolResultSchema,
  );
  return result;
}

export const mcpClient = {
  connect: async () => await client.connect(transport),
  close: async () => await client.close(),
  listTools: listTools,
  callTool: callTool,
};

// async function runTest() {
//   try {
//     console.log("Đang khởi động và kết nối tới MCP Server...");
//     await client.connect(transport);
//     console.log("✅ Kết nối thành công!\n");

//     // --- TEST 1: LẤY DANH SÁCH TOOLS ---
//     console.log("1. Đang lấy danh sách Tools...");
//     const tools = await listTools();
//     tools.forEach((tool) => {
//       console.log(`   - Tên Tool: ${tool.name}`);
//       console.log(`     Mô tả: ${tool.description}`);
//     });
//     console.log("\n");

//     // --- TEST 2: GỌI TOOL ĐỌC TÀI LIỆU ---
//     console.log(
//       "2. Đang thử gọi tool 'read_doc_contents' với doc_id là 'plan.md'...",
//     );
//     const readResult = await callTool("read_doc_contents", {
//       doc_id: "plan.md",
//     });
//     console.log("   Kết quả trả về từ Server:");
//     console.log(`   >> ${readResult.content[0].text}\n`);

//     // --- TEST 3: GỌI TOOL SỬA TÀI LIỆU ---
//     console.log("3. Đang thử gọi tool 'edit_document'...");
//     const editResult = await callTool("edit_document", {
//       doc_id: "plan.md",
//       old_str: "The plan outlines the steps for the project's implementation.",
//       new_str:
//         "Kế hoạch này đã được tôi sửa lại qua MCP Client bằng tiếng Việt.",
//     });
//     console.log("   Kết quả trả về từ Server:");
//     console.log(`   >> ${editResult.content[0].text}\n`);

//     // --- TEST 4: ĐỌC LẠI ĐỂ KIỂM TRA ĐÃ SỬA THÀNH CÔNG CHƯA ---
//     console.log("4. Kiểm tra lại nội dung 'plan.md'...");
//     const verifyResult = await callTool("read_doc_contents", {
//       doc_id: "plan.md",
//     });
//     console.log(`   >> ${verifyResult.content[0].text}\n`);
//   } catch (error) {
//     console.error("❌ Lỗi trong quá trình chạy:", error.message);
//   } finally {
//     // Ngắt kết nối để đóng tiến trình node
//     await client.close();
//     console.log("Đã ngắt kết nối.");
//   }
// }

// // Chạy test
// runTest();
