import * as path from 'path';
import { fromFileOf, generatorHtmlDefaultOutDir, Result } from '../asyncapi-generator/generator';

describe('AsyncAPI HTML generator', () => {
  beforeAll(() => {
    jest.setTimeout(120000);
  });

  it('should successfully generate HTML', async () => {
    const p = path.resolve(__dirname, 'asyncapi-sample/streetlights.yml');
    const result = await generatorHtmlDefaultOutDir(fromFileOf(p));

    expect(result).toBe(Result.Success);
  });
});