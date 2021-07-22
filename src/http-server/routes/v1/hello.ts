import { FastifyInstance, RouteShorthandOptions } from 'fastify'
import { Type, Static } from '@sinclair/typebox'

const sayHello = async (server: FastifyInstance, opts: RouteShorthandOptions, done: (error?: Error) => void) => {
  const Pong = Type.Object({
    pong: Type.String()
  })

  // JSON Schema sample
  type Pong = Static<typeof Pong>

  opts = { ...opts, schema: { response: { 200: Pong } } }

  server.get('/hello', opts, (request, reply) => {
    reply.code(200).send({ pong: 'it worked!' })
  })

  done()
}

export { sayHello }
