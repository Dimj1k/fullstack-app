import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from '../src/app.module'
import { DataSource } from 'typeorm'
import { Db, MongoClient } from 'mongodb'
import { POSTGRES_ENTITIES } from '../src/entities'
import {
    loginFifthUser,
    loginFirstUser,
    loginFourthUser,
    loginSecondUser,
    loginThirdUser,
} from './mocks/login-user.mock'
import { REFRESH_TOKEN } from '../src/constants'
import * as cookieParser from 'cookie-parser'
import { ICookie, parseCookie, sleep } from './utils'

let app: INestApplication
let connection: MongoClient
let mongo: Db
let pg: DataSource
let server: any
let secondUserAgent = 'no undefined'
beforeAll(async () => {
    connection = await MongoClient.connect('mongodb://localhost:27017')
    mongo = connection.db('test')
    pg = await new DataSource({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'test',
        password: 'test',
        database: 'test-typeorm-pg',
        entities: POSTGRES_ENTITIES,
    }).initialize()
})
beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
    app.setGlobalPrefix('api')
    app.use(cookieParser())

    await app.startAllMicroservices()
    await app.init()

    server = app.getHttpServer()
})
afterEach(async () => {
    await app.close()
})
afterAll(async () => {
    await Promise.all([
        pg
            .createQueryBuilder()
            .delete()
            .from('users')
            .where('users.email = any (:emails)', {
                emails: [
                    loginFirstUser.email,
                    loginSecondUser.email,
                    loginThirdUser.email,
                    loginFourthUser.email,
                ],
            })
            .execute(),
        mongo.collection('token').deleteMany({ userAgent: 'undefined' }),
    ])
    await Promise.all([pg.destroy(), connection.close()])
})

const checkJwtToken = (jwtToken: string) => {
    expect(jwtToken).toBeDefined()
    expect(jwtToken).toMatch(
        /^Bearer\s([a-zA-Z0-9_=]+)\.([a-zA-Z0-9_=]+)\.([a-zA-Z0-9_\-\+\/=]*)/,
    )
    return jwtToken
}

type User = { email: string; password: string }

const registrationUser = async (user: User) => {
    const createUser = { ...user, passwordConfirm: user.password }
    await request(server).post('/api/registration').send(createUser)
    let { code } = await mongo.collection('cache_user').findOne({
        email: createUser.email,
    })
    await request(server)
        .post('/api/registration/confirm')
        .send({ code })
        .expect(201)
}

describe('Auth Controller (e2e)', () => {
    describe('Login', () => {
        test('Login User - success', async () => {
            await registrationUser(loginFirstUser)
            await request(server)
                .post('/api/auth/login')
                .send(loginFirstUser)
                .expect(200)
                .then((res) => {
                    checkJwtToken(res.body.accessToken)
                })
        })
        test('Login User - error', async () => {
            await request(server)
                .post('/api/auth/login')
                .send({ ...loginFirstUser, password: 'error' })
                .expect(401, {
                    message: 'incorrect login or password',
                    error: 'Unauthorized',
                    statusCode: 401,
                })
            await request(server)
                .post('/api/auth/login')
                .send({ ...loginFirstUser, email: 'error' })
                .expect(401, {
                    message: 'incorrect login or password',
                    error: 'Unauthorized',
                    statusCode: 401,
                })
        })
    })
    describe('Refresh Tokens', () => {
        test('Get refresh token', async () => {
            let jwtToken: string
            let cookie: ICookie
            let origCookie: string
            await registrationUser(loginSecondUser)
            await request(server)
                .post('/api/auth/login')
                .send(loginSecondUser)
                .expect(200)
                .then((res) => {
                    cookie = parseCookie(res.header['set-cookie'][0])
                    expect(cookie.name).toEqual(REFRESH_TOKEN)
                    expect(cookie.value).toMatch(
                        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/,
                    )
                    origCookie = res.header['set-cookie'][0]
                    jwtToken = checkJwtToken(res.body.accessToken)
                })
        })
        test('Refresh refresh token - success', async () => {
            let oldJwtToken: string
            let oldCookie: ICookie
            let oldOrigCookie: string
            await registrationUser(loginThirdUser)
            await request(server)
                .post('/api/auth/login')
                .send(loginThirdUser)
                .expect(200)
                .then((res) => {
                    oldJwtToken = checkJwtToken(res.body.accessToken)
                    oldCookie = parseCookie(res.header['set-cookie'][0])
                    oldOrigCookie = res.header['set-cookie'][0]
                    expect(oldCookie.name).toEqual(REFRESH_TOKEN)
                    expect(oldCookie.value).toMatch(
                        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/,
                    )
                })
            await sleep(1000)
            let newJwtToken: string
            let newCookie: ICookie
            let newOrigCookie: string
            await request(server)
                .post('/api/auth/refresh-tokens')
                .set('Cookie', [oldOrigCookie])
                .send()
                .expect(200)
                .then((res) => {
                    newJwtToken = checkJwtToken(res.body.accessToken)
                    newCookie = parseCookie(res.header['set-cookie'][0])
                    newOrigCookie = res.header['set-cookie'][0]
                    expect(newCookie.name).toEqual(REFRESH_TOKEN)
                    expect(newCookie.value).toMatch(
                        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/,
                    )
                    expect(oldJwtToken).toBeDefined()
                    expect(oldOrigCookie).toBeDefined()
                    expect(newJwtToken).not.toEqual(oldJwtToken)
                    expect(newOrigCookie).not.toEqual(oldOrigCookie)
                })
        })
        test('Refresh refresh token - error', async () => {
            let cookie: ICookie
            let origCookie: string
            await registrationUser(loginFourthUser)
            await request(server)
                .post('/api/auth/login')
                .set('user-agent', 'undefined')
                .send(loginFourthUser)
                .expect(200)
                .then((res) => {
                    origCookie = res.header['set-cookie'][0]
                    cookie = parseCookie(origCookie)
                })
            await request(server)
                .post('/api/auth/refresh-tokens')
                .set('Cookie', [origCookie])
                .set('user-agent', secondUserAgent)
                .send()
                .expect(401)
            expect(
                await mongo
                    .collection('token')
                    .findOne({ token: cookie.value }),
            ).not.toBeNull()
        })
    })

    describe('logout', () => {
        test('logout', async () => {
            await registrationUser(loginFifthUser)
            await request(server)
                .post('/api/auth/login')
                .send(loginFifthUser)
                .expect(200)
                .then(async (res) => {
                    let refreshToken = res.header['set-cookie'][0]
                    await request(server)
                        .post('/api/auth/logout')
                        .set('Cookie', [refreshToken])
                        .send()
                        .expect(200)
                    expect(
                        await mongo.collection('token').findOne({
                            token: parseCookie(refreshToken).value,
                        }),
                    ).toBeNull()
                })
        })
    })
})
