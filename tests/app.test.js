const request = require('supertest');
const app = require('../app');

describe('API Health Check', () => {
  it('GET / should return 200 OK and running message', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Social Media Api Is Now Running');
  });
});