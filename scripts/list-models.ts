#!/usr/bin/env tsx
/**
 * list-models.ts — print available Copilot model IDs for the current auth context.
 *
 * Usage:
 *   npx tsx scripts/list-models.ts
 */

import { CopilotClient } from "@github/copilot-sdk";

const client = new CopilotClient();
await client.start();
try {
  const models = await client.listModels();
  for (const m of models) {
    const displayName =
      "displayName" in m && typeof m.displayName === "string"
        ? m.displayName
        : "(no displayName)";
    console.log(m.id, "|", displayName);
  }
} finally {
  await client.stop();
}
