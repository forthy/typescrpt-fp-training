import * as dotEnv from 'dotenv';
import { Option, fromNullable, map } from 'fp-ts/Option';

type MongoDBUrl = { type: 'MONGODB_URL', mongoDBUrl: string; };

const mongoDBUrlOf = (url: string): Readonly<MongoDBUrl> => ({
  type: 'MONGODB_URL',
  mongoDBUrl: url
});

interface ConfigRepo {
  /**
   * @return an `Option<MongoDBUrl>`, if the env variable `MONGODB_URL` is defined,
   * returns Some<MongoDBUrl>; otherwise none
   */
  mongoDBUrl(): Option<Readonly<MongoDBUrl>>;
}

class EnvConfigRepoImpl implements ConfigRepo {
  static of(): EnvConfigRepoImpl {
    dotEnv.config();

    return new EnvConfigRepoImpl();
  };

  mongoDBUrl(): Option<Readonly<MongoDBUrl>> {
    return map(mongoDBUrlOf)(fromNullable(process.env.MONGODB_URL));
  }
}

export { EnvConfigRepoImpl, MongoDBUrl, mongoDBUrlOf };