import { CopilotClient } from "@github/copilot-sdk";
const client = new CopilotClient();
await client.start();
const models = await client.listModels();
for (const m of models) {
  console.log(m.id, "|", m.displayName ?? "(no displayName)");
}
await client.stop();
