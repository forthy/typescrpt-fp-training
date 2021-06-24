import * as path from 'path'
import * as M from 'pattern-matching-ts/lib/match'
import { fromFileOf, generatorHtmlDefaultOutDir, Result } from '../asyncapi-generator/generator'

describe('AsyncAPI HTML generator', () => {
  beforeAll(() => {
    jest.setTimeout(150000)
  })

  it('should successfully generate HTML', async () => {
    const p = path.resolve(__dirname, 'asyncapi-sample/streetlights.yml')
    const result = await generatorHtmlDefaultOutDir(fromFileOf(p))

    const r = M.match<Result, string>({
      Success: () => 'success',
      Failure: ({ value }) => value,
      _: () => 'failure'
    })(result)

    expect(r).toBe('success')
  })
})
