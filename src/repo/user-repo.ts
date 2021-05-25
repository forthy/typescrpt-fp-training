import { TaskEither, right, map, chain, mapLeft } from 'fp-ts/TaskEither';
import { getDb, insertOne } from 'mongad';
import { MongoClient, Db, MongoError, WithId } from 'mongodb';
import { run } from 'fp-ts/lib/ReaderTaskEither';
import { pipe } from 'fp-ts/lib/function';

// data Gender = Male | Female
// data User = Name BornYear Gender
enum Gender { Male, Female };

type Name = { type: 'NAME', name: string };
type BornYear = { type: 'BORN_YEAR', year: number };

interface User {
    name: Name;
    bornYear: BornYear;
    gender: Gender;
}
const nameOf = (name: string): Readonly<Name> => ({
    type: 'NAME',
    name
});
const bornYearOf = (year: number): Readonly<BornYear> => ({
    type: 'BORN_YEAR',
    year
});

/**
 * UserRepo is a collection of functions that handle `User` type's data management.
 */
interface UserRepo {
    /**
     * insertUser :: Name -> Gender -> BornYear -> TaskEither Error Readonly User
     * Insert a `User` to the datastore, given her/his name, gender and born year.
     * 
     * @param name - the name of this user
     * @parm gender - the gender of this user; either `Male` or `Female`
     * @param bornYear - the year this user was born
     * 
     * @returns a promise of `Either<Error, Readonly<User>>`: the returned `User` is immutable
     */
    insertUser(name: Name, gender: Gender, bornYear: BornYear): TaskEither<Error, Readonly<User>>;
}

class TestUserRepoImpl implements UserRepo {
    /**
     * A smart constructor of `TestUserRepoImpl` instance.
     * 
     * @returns a `TestUserRepoImpl` instance
     */
    static of(): TestUserRepoImpl { return new TestUserRepoImpl(); }

    insertUser(name: Name, gender: Gender, bornYear: BornYear): TaskEither<Error, Readonly<User>> { return right({ name, gender, bornYear }); }
}

// MongoDB support
class MongoUserRepoImpl implements UserRepo {
    private readonly USER_COLLECTION = 'user';
    private readonly USER_DB = 'user-management';

    private readonly mongoClientTE: TaskEither<MongoError, MongoClient>;

    private constructor(mongoClientTE: TaskEither<MongoError, MongoClient>) {
        this.mongoClientTE = mongoClientTE;
    }
    static of(mongoClientTE: TaskEither<MongoError, MongoClient>): MongoUserRepoImpl {
        return new MongoUserRepoImpl(mongoClientTE);
    }

    private userToDoc(u: User) {
        return {
            name: u.name.name,
            gender: u.gender === Gender.Male ? 'male' : 'female',
            bornYear: u.bornYear.year
        };
    };

    insertUser(name: Name, gender: Gender, bornYear: BornYear): TaskEither<Error, Readonly<User>> {
        const insertOneTE: (db: Db) => TaskEither<MongoError, WithId<{ name: string, gender: string, bornYear: number; }>> =
            (db: Db) => () => run(insertOne(this.USER_COLLECTION, this.userToDoc({ name, gender, bornYear })), db);

        return pipe(
            this.mongoClientTE,
            map(getDb(this.USER_DB)),
            chain(insertOneTE),
            mapLeft((e) => new Error(`Message: ${e.message} - Label: ${JSON.stringify(e.errorLabels)}`)),
            map(_ => ({ name, gender, bornYear }))
        );
    }
}

export { Gender, Name, BornYear, User, nameOf, bornYearOf, TestUserRepoImpl, MongoUserRepoImpl };