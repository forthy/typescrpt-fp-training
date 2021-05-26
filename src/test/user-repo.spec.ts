import * as U from '../repo/user-repo';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import { connect } from 'mongad';
import { MongoError, MongoClient } from 'mongodb';
import { GenericContainer, StartedTestContainer, StoppedTestContainer } from 'testcontainers';
// import { LogWaitStrategy } from 'testcontainers/dist/wait-strategy';

describe('User repository', () => {
  let tc: StartedTestContainer;
  let mongoDBPort: number;

  beforeAll(async () => {
    jest.setTimeout(120000);

    tc = await new GenericContainer('mongo:latest')
      .withExposedPorts(27017)
      .withDefaultLogDriver()
      // MongoDB 4.9 has no `waiting for connections on port` log text. XD
      // .withWaitStrategy(new LogWaitStrategy('waiting for connections on port'))
      .start();

    mongoDBPort = tc.getMappedPort(27017);
  });

  afterAll(async () => {
    await TE.match<Error, void, StoppedTestContainer>(
      e => console.log(e.message),
      c => console.log(`container: ${JSON.stringify(c, null, 2)} was stopped successfully`)
    )(TE.tryCatch(
      () => tc.stop(),
      e => new Error(`Test container closing error: ${JSON.stringify(e)}`)
    ))();

    // Imperative way of stopping the MongoDB container
    // try {
    //   await tc.stop();
    // } catch (e) {
    //   console.log(`Test container closing error: ${JSON.stringify(e)}`);
    // }
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
