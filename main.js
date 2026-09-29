import { Anthropic } from "@anthropic-ai/sdk";
import readline from "readline";
import dotenv from "dotenv";
import { mcpClient } from "./client.js";

dotenv.config();

const anthropic = new Anthropic({
  apiKey: process.env.MODEL_API_KEY,
});

function formatToolsForAnthropic(mcpTools) {
  return mcpTools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    input_schema: tool.inputSchema,
  }));
}

// Chat loop
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askQuestion = (query) =>
  new Promise((resolve) => rl.question(query, resolve));

async function runMain() {
  try {
    console.log("Khởi động MCP Client...");
    await mcpClient.connect();

    // 1. Lấy danh sách tools từ server (Tool Discovery)
    const availableMcpTools = await mcpClient.listTools();
    const anthropicTools = formatToolsForAnthropic(availableMcpTools);

    console.log("Đã lấy được danh sách Tools. Bot đã sẵn sàng!\n");
    console.log("(Gõ 'exit' để thoát)");

    // Khởi tạo lịch sử hội thoại
    let messages = [];

    while (true) {
      // 2. Nhận User Query (ví dụ: "What is the contents of the report.pdf document?")
      const userPrompt = await askQuestion("\nUser: ");
      if (userPrompt.toLowerCase() === "exit") break;

      messages.push({ role: "user", content: userPrompt });

      // 3. Gửi Request lên Claude cùng với Tools
      let response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        tools: anthropicTools,
        messages: messages,
      });

      // 4. Xử lý Vòng lặp Gọi Tool (nếu Claude quyết định dùng tool)
      while (response.stop_reason === "tool_use") {
        const toolUseBlock = response.content.find(
          (block) => block.type === "tool_use",
        );

        console.log(
          `\n[Agent đang suy nghĩ] -> Quyết định gọi tool: ${toolUseBlock.name}`,
        );
        console.log(`[Tham số truyền vào] ->`, toolUseBlock.input);

        // Gọi tool thực tế thông qua MCP Client
        let toolResultText = "";
        try {
          const mcpResult = await mcpClient.callTool(
            toolUseBlock.name,
            toolUseBlock.input,
          );
          toolResultText = mcpResult.content[0].text;
          console.log(
            `[Kết quả từ Server] -> ${toolResultText.substring(0, 50)}...\n`,
          );
        } catch (error) {
          toolResultText = `Error calling tool: ${error.message}`;
          console.log(`[Lỗi gọi Tool] -> ${toolResultText}`);
        }

        // Lưu lại lịch sử: câu trả lời của trợ lý (có chứa tool_use)
        messages.push({ role: "assistant", content: response.content });

        // Gửi kết quả (tool_result) ngược lại cho Claude
        messages.push({
          role: "user",
          content: [
            {
              type: "tool_result",
              tool_use_id: toolUseBlock.id,
              content: toolResultText,
            },
          ],
        });

        // Gọi Claude lần nữa để tổng hợp câu trả lời cuối cùng
        response = await anthropic.messages.create({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 1024,
          tools: anthropicTools,
          messages: messages,
        });
      }

      // 5. In ra câu trả lời cuối cùng cho người dùng
      const finalReply = response.content.find(
        (block) => block.type === "text",
      ).text;
      console.log(`\nClaude: ${finalReply}`);

      // Lưu lại phản hồi cuối cùng vào lịch sử
      messages.push({ role: "assistant", content: finalReply });
    }
  } catch (error) {
    console.error("Lỗi hệ thống:", error);
  } finally {
    await mcpClient.close();
    rl.close();
  }
}

runMain();
