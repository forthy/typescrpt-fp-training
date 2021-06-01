import * as S from '../http-server/index';

const svr = S.server;

describe('Hello route', () => {
  it(`hello should say 'hello'`, async () => {
    const response = await svr.inject({ method: 'GET', url: '/v1/hello' });

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe(JSON.stringify({ pong: 'it worked!' }));
  });
});