// tests/agentSkill.test.ts
import request from "supertest";
import { app } from "../server"; // Express app exported from server.ts

describe("UI Agent & Skill integration", () => {
  it("should invoke skill and return generated component", async () => {
    const response = await request(app)
      .post("/start")
      .send({ figmaUrl: "https://www.figma.com/file/ABC12345/Example" })
      .expect(200);
    expect(response.body.success).toBe(true);
    expect(response.body.output).toContain("GeneratedComponent");
    // The output should be a string of React component code
    expect(typeof response.body.output).toBe("string");
  });
});
