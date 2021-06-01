import * as path from 'path';
import * as TE from 'fp-ts/TaskEither';

const Generator = require('@asyncapi/generator');

export enum Result { Success = 'success', Failure = 'failure' };

interface OutDir {
  readonly path: string
}
export const outDirOf = (path: string): Readonly<OutDir> => ({ path });

type FromFile =
  {
    readonly type: 'FILE',
    readonly file: string
  }
type FromUrl = {
  readonly type: 'URL',
  readonly url: string
}

export const fromFileOf: (file: string) => Readonly<FromFile> = (file) => ({ type: 'FILE', file });
export const fromUrlOf: (url: string) => Readonly<FromUrl> = (url) => ({ type: 'URL', url });

type Method = FromFile | FromUrl;

export const generatorHtml = (out: OutDir) => async (method: Method): Promise<Result> => {
  let handler: TE.TaskEither<Error, void>;

  const generator = new Generator('@asyncapi/html-template', out.path);

  switch (method.type) {
    case 'URL':
      handler = TE.tryCatch<Error, void>(
        async () => await generator.generateFromURL(method.url),
        e => new Error(`Failed to generate from the URL (${method.url}): ${e}`)
      )

      break;

    case 'FILE':
    default:
      handler = TE.tryCatch<Error, void>(
        async () => await generator.generateFromFile(method.file),
        e => new Error(`Failed to generate from the file (${method.file}): ${e}`)
      )

      break;
  }

  return TE.match<Error, Result, void>(
    e => {
      // DEBUG
      console.log(`Error: ${e.message}`);

      return Result.Failure;
    },
    _ => {
      // DEBUG
      console.log('Done!');

      return Result.Success;
    }
  )(handler)();
}

// Currying sample
export const generatorHtmlDefaultOutDir = generatorHtml(outDirOf('out'));

// generatorHtml(fromFileOf('../test/asyncapi-sample/streetlights.yml'));
