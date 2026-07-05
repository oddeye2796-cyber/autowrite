import { runSkill } from "../src/skills/uiComponentSkill";

describe("UI Component Generation Skill", () => {
  it("returns placeholder component when FIGMA_TOKEN is missing", async () => {
    // Ensure no FIGMA_TOKEN env var
    delete process.env.FIGMA_TOKEN;
    const figmaUrl = "https://www.figma.com/file/ABC12345/ExampleDesign";
    const result = await runSkill({ figmaUrl });
    expect(result.success).toBe(true);
    expect(result.output).toContain("GeneratedComponent");
    expect(result.output).toContain("ABC12345");
  });
});
