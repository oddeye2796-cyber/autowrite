import { GoogleGenAI } from '@google/genai';

// Simple mock implementation of GoogleGenAI
export class MockGoogleGenAI {
  models = {
    generateContent: async ({ model, contents, config }: any) => {
      // Return a deterministic response based on model name
      const responseText = JSON.stringify({ mockModel: model, received: contents });
      return { text: responseText };
    },
  };
}

// Override the import in tests using jest.mock
export default MockGoogleGenAI;
