import { FastifyInstance } from 'fastify';
import { Server, IncomingMessage, ServerResponse } from 'http';
import * as S from '../http-server/server';
import { fastifyPortOf } from '../repo/config-repo';
import { tryCatch, match } from 'fp-ts/Either';

let svr: FastifyInstance<
  Server,
  IncomingMessage,
  ServerResponse
>

describe('Hello route', () => {
  beforeAll(() => {
    svr = S.startFastify(fastifyPortOf(8888));
  });

  afterAll(() => {
    match(
      e => console.log(e),
      _ => console.log('Closing Fastify server is done!')
    )(tryCatch(
      () => svr.close(() => {}),
      (reason) => new Error(`Failed to close a Fastify server, reason: ${reason}`)
    ));
  });

  it(`hello should say 'hello'`, async () => {
    const response = await svr.inject({ method: 'GET', url: '/v1/hello' });

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe(JSON.stringify({ pong: 'it worked!' }));
  });
});
