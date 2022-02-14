/* eslint-disable @typescript-eslint/no-use-before-define */
import {INestApplication} from '@nestjs/common';
import {Test} from '@nestjs/testing';
import {getConnectionToken, MongooseModule} from '@nestjs/mongoose';
import {Connection} from 'mongoose';
import * as request from 'supertest';
import {ConfigModule} from '@nestjs/config';

import {AuthModule} from '.';


let app: INestApplication;
let connection: Connection;

beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
        imports: [
            MongooseModule.forRoot('mongodb://localhost/test'),
            ConfigModule.forRoot({
                envFilePath: `.env.test`
            }),
            AuthModule
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

describe(`when signing up`, () => {
    let signUpResponse: request.Response;

    beforeEach(async () => {
        signUpResponse = await signUp('sample.email@server.test', 'a test password');
    })

    it(`should return 201 code and user`, () => {
        expect(signUpResponse.status).toBe(201)
        expect(signUpResponse.body).toStrictEqual({
            email: 'sample.email@server.test',
            id: expect.any(String),
        })
    })
})

describe(`when signing in`, () => {
    describe(`when user does not exists`, () => {
        let signInResponse: request.Response;
        beforeEach(async () => {
            signInResponse = await signIn('not.existing@server.test', 'a test password');
        })

        it(`should respond with 401`, async () => {
            expect(signInResponse.status).toBe(401);
            expect(signInResponse.body).toStrictEqual({
                statusCode: 401,
                message: 'Unauthorized'
            });
        })
    })

    describe(`when user exists`, () => {
        beforeEach(async () => {
            await signUp('existing@server.test', 'valid password');
        })

        describe(`when password is invalid`, () => {
            let signInResponse: request.Response;
            beforeEach(async () => {
                signInResponse = await signIn('existing@server.test', 'invalid password');
            })

            it(`should respond with 401`, () => {
                expect(signInResponse.status).toBe(401);
                expect(signInResponse.body).toStrictEqual({
                    statusCode: 401,
                    message: 'Unauthorized'
                });
            })
        })

        describe(`when password is valid`, () => {
            let signInResponse: request.Response;
            beforeEach(async () => {
                signInResponse = await signIn('existing@server.test', 'valid password');
            })

            it(`should respond with 200`, () => {
                expect(signInResponse.status).toBe(200);
                expect(signInResponse.body).toStrictEqual({
                    email: 'existing@server.test',
                    id: expect.any(String),
                    accessToken: expect.any(String),
                });
            })
        })
    })
})

describe(`when getting profile info`, () => {
    describe(`when token invalid`, () => {
        let userInfoResponse: request.Response;
        beforeEach(async () => {
            userInfoResponse = await userInfo(
                `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`
            );
        })

        it(`should be unauthorized`, async () => {
            expect(userInfoResponse.status).toBe(401)
        })
    })

    describe(`when user signed up and signed in`, () => {
        let userInfoResponse: request.Response;
        let userId: string
        let accessToken: string
        beforeEach(async () => {
            await signUp('email@example.test', 'password1');
            const signInResponse = await signIn('email@example.test', 'password1');
            ({id: userId, accessToken} = signInResponse.body)

            userInfoResponse = await userInfo(accessToken);
        })

        it(`should get user info`, () => {
            expect(userInfoResponse.body).toStrictEqual({
                email: 'email@example.test',
                id: userId,
            })
        })

        describe(`when token timed out`, () => {
            let secondUserInfoResponse: request.Response;
            beforeEach(async () => {
                jest.useFakeTimers('modern')
                    .advanceTimersByTime(
                        15 // min
                        * 60 // sec
                        * 1000 // ms
                    )

                secondUserInfoResponse = await userInfo(accessToken);
            })

            afterEach(() => {
                jest.useRealTimers()
            })

            it(`should be unauthorized`, () => {
                expect(secondUserInfoResponse.status).toBe(401)
            })
        })
    })
})

describe(`when signed up with 72 bytes password`, () => {
    beforeEach(async () => {
        await signUp(`mail@example.test`, Array(72).fill('a').join(''))
    })

    describe(`when try to sign in with 73 bytes password`, () => {
        let signInResponse: request.Response;
        beforeEach(async () => {
            signInResponse = await signIn(`mail@example.test`, Array(73).fill('a').join(''));
        })

        it(`should be unauthorized`, () => {
            expect(signInResponse.status).toBe(401)
        })
    })
})

const signIn = async (email: string, password: string): Promise<request.Response> =>
    await request(app.getHttpServer()).post('/signin').send({email, password})
const signUp = async (email: string, password: string): Promise<request.Response> =>
    await request(app.getHttpServer()).post('/signup').send({email, password})
const userInfo = async (token: string): Promise<request.Response> =>
    await request(app.getHttpServer()).get('/me').auth(token, {type: 'bearer'}).send()