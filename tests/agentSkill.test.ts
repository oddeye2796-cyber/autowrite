// tests/agentSkill.test.ts
import request from "supertest";
import { app } from "../server";

// Mock @google/genai with Type enum
jest.mock('@google/genai', () => {
  const { MockGoogleGenAI } = require('../tests/utils/mockGemini');
  return {
    GoogleGenAI: MockGoogleGenAI,
    Type: {
      ARRAY: 'ARRAY',
      OBJECT: 'OBJECT',
      STRING: 'STRING',
      NUMBER: 'NUMBER',
      BOOLEAN: 'BOOLEAN',
    },
  };
});

describe("API endpoint validation", () => {
  it("POST /api/analyze-rfp returns valid analysis when given input", async () => {
    const response = await request(app)
      .post("/api/analyze-rfp")
      .send({
        rfpText: "테스트 RFP 요청서 내용",
        announcementText: "테스트 공고문 내용",
        companyName: "테스트사",
      });
    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
  });

  it("POST /api/generate-section returns content", async () => {
    const response = await request(app)
      .post("/api/generate-section")
      .send({
        rfpText: "테스트 RFP",
        subTitle: "테스트 섹션",
        announcementText: "공고문",
      });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("content");
    expect(typeof response.body.content).toBe("string");
  });
});
