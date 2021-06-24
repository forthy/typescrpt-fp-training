/* eslint-disable @typescript-eslint/no-var-requires */
// import * as path from 'path'
import * as TE from 'fp-ts/TaskEither'
import * as E from 'fp-ts/Either'
import * as M from 'pattern-matching-ts/lib/match'

const Generator = require('@asyncapi/generator')

export type Success = {
  readonly _tag: 'Success'
}
const successOf: () => Readonly<Success> = () => ({ _tag: 'Success' })

export type Failure = {
  readonly _tag: 'Failure'
  readonly value: string
}
const failureOf: (msg: string) => Readonly<Failure> = (msg) => ({
  _tag: 'Failure',
  value: msg
})

export type Result = Success | Failure

interface OutDir {
  readonly path: string
}
export const outDirOf = (path: string): Readonly<OutDir> => ({ path })

type FromFile = {
  readonly _tag: 'FromFile'
  readonly value: string
}
type FromUrl = {
  readonly _tag: 'FromUrl'
  readonly value: string
}

export const fromFileOf: (file: string) => Readonly<FromFile> = (file) => ({ _tag: 'FromFile', value: file })
export const fromUrlOf: (url: string) => Readonly<FromUrl> = (url) => ({ _tag: 'FromUrl', value: url })

type Method = FromFile | FromUrl

export const generatorHtml =
  (out: OutDir) =>
  async (method: Method): Promise<Result> => {
    const generator = new Generator('@asyncapi/html-template', out.path)

    const handler = M.match<Method, TE.TaskEither<Error, void>>({
      FromUrl: ({ value: url }) =>
        TE.tryCatch<Error, void>(
          async () => await generator.generateFromURL(url),
          (e) => new Error(`Failed to generate from the URL (${url}): ${e}`)
        ),
      FromFile: ({ value: file }) =>
        TE.tryCatch<Error, void>(
          async () => await generator.generateFromFile(file),
          (e) => new Error(`Failed to generate from the file (${file}): ${e}`)
        ),
      _: () => TE.fromEither(E.left(new Error('Unrecognised method')))
    })

    return TE.match<Error, Result, void>(
      (e) => failureOf(`Error: ${e.message}`),
      (_) => successOf()
    )(handler(method))()
  }

// Currying sample
export const generatorHtmlDefaultOutDir = generatorHtml(outDirOf('out'))

// generatorHtml(fromFileOf('../test/asyncapi-sample/streetlights.yml'));
