import * as U from '../repo/user-repo';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import { connect } from 'mongad';
import { MongoError, MongoClient } from 'mongodb';
import { GenericContainer, StartedTestContainer } from 'testcontainers';
import { LogWaitStrategy } from 'testcontainers/dist/wait-strategy';

describe('User repository', () => {
  let tc: StartedTestContainer;
  let mongoDBPort: number;

  beforeAll(async () => {
    jest.setTimeout(30000);

    tc = await new GenericContainer('mongo:4.2')
      .withExposedPorts(27017)
      .withDefaultLogDriver()
      .withWaitStrategy(new LogWaitStrategy('waiting for connections on port'))
      .start();

    mongoDBPort = tc.getMappedPort(27017);
  });

  afterAll(async () => {
    try {
      await tc.stop();
    } catch (e) {
      console.log(`Test container closing error: ${JSON.stringify(e)}`);
    }
  });

  it('should successfully initiate a User instance', () => {
    const richard = {
      name: U.nameOf('Richard Chuo'),
      gender: U.Gender.Male,
      bornYear: U.bornYearOf(1969)
    };

    expect(richard).toStrictEqual({
      name: U.nameOf('Richard Chuo'),
      gender: U.Gender.Male,
      bornYear: U.bornYearOf(1969)
    });
  });

  it('should successfully insert a User', async () => {
    const name = U.nameOf('Richard Chuo');
    const gender = U.Gender.Male;
    const bornYear = U.bornYearOf(1969);

    const richard: Readonly<U.User> = { name, gender, bornYear };

    // An UserRepo stub;
    const userRepo = U.TestUserRepoImpl.of();

    expect(await userRepo.insertUser(name, gender, bornYear)()).toStrictEqual(E.right(richard));

    const mongoClientTE = connect(`mongodb://localhost:${mongoDBPort}`);
    const mongoUserRepo = U.MongoUserRepoImpl.of(mongoClientTE);

    E.match<Error, U.User, void>(
      e => fail(e),
      u => expect(u).toStrictEqual(richard)
    )(await mongoUserRepo.insertUser(name, gender, bornYear)());

    await TE.match<MongoError, void, void>(
      e => console.log(`err: ${JSON.stringify(e, null, 2)}`),
      _ => console.log(`MongoClient was successfully closed`)
    )(TE.chain<MongoError, MongoClient, void>(client => TE.fromTask(() => client.close(true)))(mongoClientTE))();
  });
});