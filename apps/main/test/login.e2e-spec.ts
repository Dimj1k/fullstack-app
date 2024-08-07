import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from '../src/app.module'
import { DataSource } from 'typeorm'
import { Db, MongoClient } from 'mongodb'
import { POSTGRES_ENTITIES } from '../src/entities'
import {
    loginUserSuccess,
    registrationUserForLogin,
} from './mocks/login-user.mock'
import { REFRESH_TOKEN } from '../src/constants'
import * as cookieParser from 'cookie-parser'

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

interface ICookie {
    name: string
    value: string
    path: string
    expires: Date
    httpOnly: boolean
    secure: boolean
    SameSite: 'lax' | 'strict' | 'none'
}

function split(str: string, splitter: string, limit: number = Infinity) {
    let splitting = []
    let beforeSpliter = ''
    for (let char of str) {
        if (char !== splitter) beforeSpliter += char
        else {
            if (splitting.length !== limit) {
                splitting.push(beforeSpliter)
                beforeSpliter = ''
            } else beforeSpliter += splitter
        }
    }
    splitting.push(beforeSpliter)
    return splitting
}

function parseCookie(cookie: string): ICookie {
    let [name, values] = split(cookie, '=', 1)
    let [value, path, expires, ...options] = values.split('; ')
    return {
        name,
        value,
        path: path.split('=')[1],
        expires: new Date(expires.split('=')[1]),
        httpOnly: options.includes('HttpOnly'),
        secure: options.includes('Secure'),
        SameSite: options.at(-1).split('=')[1].toLowerCase() as
            | 'lax'
            | 'strict'
            | 'none',
    }
}

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
afterAll(async () => {
    await Promise.all([
        pg
            .createQueryBuilder()
            .delete()
            .from('users')
            .where('users.email = :email', {
                email: registrationUserForLogin.email,
            })
            .execute(),
        mongo.collection('token').deleteMany({ userAgent: 'undefined' }),
    ])
    await Promise.all([pg.destroy(), connection.close()])
    await app.close()
})

const checkJwtToken = (jwtToken: string) => {
    expect(jwtToken).toBeDefined()
    let token = JSON.parse(jwtToken) as { accessToken: string }
    expect(token).toHaveProperty('accessToken')
    let jwt = token.accessToken
    expect(jwt).toMatch(
        /^Bearer\s([a-zA-Z0-9_=]+)\.([a-zA-Z0-9_=]+)\.([a-zA-Z0-9_\-\+\/=]*)/,
    )
    return jwt
}

describe('Auth Controller (e2e)', () => {
    test('Create User - success', async () => {
        await request(server)
            .post('/api/registration')
            .send(registrationUserForLogin)
        let { code } = await mongo.collection('cache_user').findOne({
            email: registrationUserForLogin.email,
        })
        await request(server)
            .post('/api/registration/confirm')
            .send({ code })
            .timeout(50)
            .expect(201)
    })
    describe('Login', () => {
        test('Login User - success', async () => {
            await request(server)
                .post('/api/auth/login')
                .send(loginUserSuccess)
                .expect(200)
                .then((res) => {
                    checkJwtToken(res.text)
                })
        })
        test('Login User - error', async () => {
            await request(server)
                .post('/api/auth/login')
                .send({ ...loginUserSuccess, password: '6fh' })
                .expect(401, {
                    message: 'incorrect login or password',
                    error: 'Unauthorized',
                    statusCode: 401,
                })
            await request(server)
                .post('/api/auth/login')
                .send({ ...loginUserSuccess, email: 'error' })
                .expect(401, {
                    message: 'incorrect login or password',
                    error: 'Unauthorized',
                    statusCode: 401,
                })
        })
    })
    let jwtToken: string
    let cookie: ICookie
    let origCookie: string
    describe('Refresh Tokens', () => {
        test('Get refresh token', async () => {
            await request(server)
                .post('/api/auth/login')
                .send(loginUserSuccess)
                .then((res) => {
                    cookie = parseCookie(res.header['set-cookie'][0])
                    expect(cookie.name).toEqual(REFRESH_TOKEN)
                    expect(cookie.value).toMatch(
                        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/,
                    )
                    origCookie = res.header['set-cookie'][0]
                })
        })
        let newJwtToken: string
        let newOrigCookie: string
        let newCookie: ICookie
        test('Refresh refresh token - success', async () => {
            await request(server)
                .post('/api/auth/refresh-tokens')
                .set('Cookie', [origCookie])
                .send()
                .expect(200)
                .then((res) => {
                    newJwtToken = checkJwtToken(res.text)
                    expect(jwtToken).not.toEqual(newJwtToken)
                    newCookie = parseCookie(res.header['set-cookie'][0])
                    newOrigCookie = res.header['set-cookie'][0]
                    expect(newCookie.name).toEqual(REFRESH_TOKEN)
                    expect(newCookie.value).toMatch(
                        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/,
                    )
                    expect(newCookie.value).not.toEqual(cookie.value)
                })
        })
        test('Refresh refresh token - error', async () => {
            await request(server)
                .post('/api/auth/refresh-tokens')
                .set('Cookie', [newOrigCookie])
                .set('user-agent', secondUserAgent)
                .send()
                .expect(401)
        })
    })

    describe('logout', () => {
        test('logout', async () => {
            await request(server)
                .post('/api/auth/login')
                .send(loginUserSuccess)
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
