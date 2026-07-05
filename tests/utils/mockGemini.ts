// Simple mock implementation of GoogleGenAI
export class MockGoogleGenAI {
  models = {
    generateContent: async ({ model, contents, config }: any) => {
      // If responseMimeType is JSON, return parseable JSON
      if (config?.responseMimeType === 'application/json') {
        // For check-consistency endpoint, return audit results array
        const responseText = JSON.stringify([]);
        return { text: responseText };
      }
      // Default: return a simple text mock
      const responseText = JSON.stringify({ mockModel: model, received: contents });
      return { text: responseText };
    },
  };
}

// Override the import in tests using jest.mock
export default MockGoogleGenAI;
