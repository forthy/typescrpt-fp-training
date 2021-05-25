import { EnvConfigRepoImpl, mongoDBUrlOf } from '../repo/config-repo';
import { some } from 'fp-ts/Option';

describe('Config repository', () => {
  it('should acquire MongoDB URL', () => {
    const configRepo = EnvConfigRepoImpl.of();

    expect(configRepo.mongoDBUrl()).toStrictEqual(some(mongoDBUrlOf('mongodb://localhost:27017')));
  });
});