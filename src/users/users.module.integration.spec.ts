import {INestApplication} from '@nestjs/common';
import {Test} from '@nestjs/testing';
import {getConnectionToken, MongooseModule} from '@nestjs/mongoose';
import {Connection} from 'mongoose';

import {User, UsersModule, UsersRepository} from '.';

let app: INestApplication;
let connection: Connection;

beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
        imports: [
            MongooseModule.forRoot('mongodb://localhost/test'),
            UsersModule
        ],
    }).compile();

    app = testingModule.createNestApplication();
    await app.init();

    connection = app.get(getConnectionToken());
});

afterAll(async () => {
    await app.close()
})

afterEach(async () => {
    await connection.db.dropDatabase()
})

describe(`when creating a user`, () => {
    let usersRepository: UsersRepository;
    beforeEach(async () => {
        usersRepository = app.get(UsersRepository);

        await usersRepository.createUser({
            email: 'example.email@example.com',
            passwordHash: 'aPasswordHash'
        })
    });

    describe(`when finding the user`, () => {
        let foundUser: User | null;
        beforeEach(async () => {
            foundUser = await usersRepository.findUser('example.email@example.com');
        })

        it(`should return the user`, () => {
            expect(foundUser).toStrictEqual(new User(
                'example.email@example.com',
                'aPasswordHash',
            ))
        })
    })

    describe(`when finding a not existing user`, () => {
        let foundUser: User | null;
        beforeEach(async () => {
            foundUser = await usersRepository.findUser('nonexisting@example.com');
        })

        it(`should be null`, () => {
            expect(foundUser).toBeNull()
        })
    })
})