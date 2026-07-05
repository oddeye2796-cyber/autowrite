import request from 'supertest';
import { app } from '../server';

jest.mock('@google/genai', () => {
  const { MockGoogleGenAI } = require('../tests/utils/mockGemini');
  return { GoogleGenAI: MockGoogleGenAI };
});

describe('API routes', () => {
  test('POST /api/parse-file returns text for PDF', async () => {
    const response = await request(app)
      .post('/api/parse-file')
      .send({ base64: Buffer.from('test').toString('base64'), filename: 'test.pdf' });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('text');
  });

  test('POST /api/analyze-rfp missing fields returns 400', async () => {
    const response = await request(app).post('/api/analyze-rfp').send({});
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  test('POST /api/generate-section success', async () => {
    const response = await request(app)
      .post('/api/generate-section')
      .send({ rfpText: 'test', announcementText: 'test', subTitle: 'section' });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('content');
  });

  test('POST /api/check-consistency returns score', async () => {
    const response = await request(app)
      .post('/api/check-consistency')
      .send({ sections: [] });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('score');
  });
});
