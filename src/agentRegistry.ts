// src/agentRegistry.ts
import { runSkill as uiComponentSkill } from "./skills/uiComponentSkill";

/**
 * Central registry of agents used by the application.
 * Each agent is defined by an entry point and a handler function.
 */
export const agents = {
  // Existing agents can be listed here.
  uiAgent: {
    entry: "/start",
    /**
     * Handler for the UI component generation agent.
     * Expects payload with { figmaUrl: string }.
     */
    handler: async (payload: any) => {
      const result = await uiComponentSkill({ figmaUrl: payload.figmaUrl });
      return result;
    },
  },
};

// Optional: expose a helper to retrieve an agent by entry path.
export function getAgentByEntry(entry: string) {
  return Object.values(agents).find((agent: any) => agent.entry === entry);
}
