import fastify, { FastifyInstance } from 'fastify';
import { Server, IncomingMessage, ServerResponse } from 'http';
import { fromNullable, match, map, getOrElse } from 'fp-ts/Option';
import { FastifyPort, EnvConfigRepoImpl, RuntimeEnv } from '../repo/config-repo';
import { sayHello } from './routes/v1/hello';
import FastifyStatic from 'fastify-static'
import path from 'path'

const shouldPrettyPrint = getOrElse(() => false)(map<RuntimeEnv, boolean>(e => e.env === 'dev')(EnvConfigRepoImpl.of().runtimeEnv()));
const server: FastifyInstance<
  Server,
  IncomingMessage,
  ServerResponse
> = fastify({ logger: { prettyPrint: shouldPrettyPrint } });

/**
 * Start a Fastify server
 * 
 * @param port - HTTP/s port for this Fastify server
 * @returns a Fastify server instance
 */
const startFastify: (port: FastifyPort) => FastifyInstance<
  Server,
  IncomingMessage,
  ServerResponse
> = (port) => {
  server.listen(port, (err, _) => {
    // if (err) {
    //   console.error(err);
    //   process.exit(0);
    // }

    match<Error, void>(
      () => console.log('Yo! I am alive!'),
      e => {
        console.error(e);
        process.exit(0);
      }
    )(fromNullable(err));
  });

  server.register(FastifyStatic, {
    root: path.join(__dirname, '../../client'),
    prefix: '/',
  })

  server.register(sayHello, { prefix: '/v1' });

  return server;
};

export { startFastify }
