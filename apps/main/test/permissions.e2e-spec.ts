import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from '../src/app.module'
import { DataSource } from 'typeorm'
import { Db, MongoClient } from 'mongodb'
import { POSTGRES_ENTITIES } from '../src/entities'
import { JwtService } from '@nestjs/jwt'
import { UserService } from '../src/user/user.service'
import { adminUser, noAdminUser, password } from './mocks/permissions.mock'
import { TypeOrmModule } from '@nestjs/typeorm'
import { NestExpressApplication } from '@nestjs/platform-express'
import { mockBook } from './mocks/books.mock'
import { JwtPayload } from '../src/interfaces/jwt-controller.interface'
import { ROLE } from '../src/entities/user/user.entity'
import * as cookieParser from 'cookie-parser'
import { TypeUser } from './login.e2e-spec'
import { fakeJwt } from './mocks/fakeJwt.json'
import { sleep } from './utils'

let app: INestApplication
let connection: MongoClient
let mongo: Db
let pg: DataSource
let jwtService: JwtService
let server: any
let userService: UserService
beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule, TypeOrmModule.forFeature(POSTGRES_ENTITIES)],
        providers: [UserService],
    }).compile()
    userService = moduleFixture.get<UserService>(UserService)
    let [{ id }, _] = await Promise.all([
        userService.createUser({ ...adminUser, password }),
        userService.createUser({ ...noAdminUser, password }),
    ])
    await userService.upgradeToAdmin(id)
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

    app = moduleFixture.createNestApplication<NestExpressApplication>()
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
    app.setGlobalPrefix('api')
    app.use(cookieParser())

    await app.startAllMicroservices()
    await app.init()
    jwtService = moduleFixture.get<JwtService>(JwtService)

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
                emails: [noAdminUser.email, adminUser.email],
            })
            .execute(),
        pg
            .createQueryBuilder()
            .delete()
            .from('books')
            .where('books.name_book = any (:nameBooks)', {
                nameBooks: [
                    mockBook.nameBook + 'Admin',
                    mockBook.nameBook + 'User',
                ],
            })
            .execute(),
        mongo.collection('token').deleteMany({ userAgent: 'undefined' }),
    ])
    await Promise.all([pg.destroy(), connection.close()])
})

async function getJwtToken(user: TypeUser): Promise<string>
async function getJwtToken(
    user: TypeUser,
    withType: true,
): Promise<[string, string]>
async function getJwtToken(user: TypeUser, withType = false) {
    let accessToken = (
        await request(server).post('/api/auth/login').send(user).expect(200)
    ).body.accessToken as string
    return withType ? accessToken.split(' ') : accessToken
}

test.each([
    ['Admin has roles ADMIN and USER', adminUser, [ROLE.ADMIN, ROLE.USER]],
    ['User has role USER only', noAdminUser, [ROLE.USER]],
])('%s', async (name, user, roles) => {
    let [type, jwtToken] = await getJwtToken(user, true)
    expect(type.toLowerCase()).toEqual('bearer')
    let jwtPayload = (await jwtService.verifyAsync(jwtToken)) as JwtPayload
    expect(jwtPayload.roles.sort()).toEqual(roles.sort())
})

describe('Permissions check (e2e)', () => {
    describe('Users with jwt', () => {
        test.each([
            ['Admin', adminUser, 201],
            ['User', noAdminUser, 403],
        ])('Admin permission check by %s', async (role, user, statusCode) => {
            let jwtToken = await getJwtToken(user)
            let res = await request(server)
                .post('/api/books/create')
                .set('authorization', jwtToken)
                .send({ ...mockBook, nameBook: mockBook.nameBook + role })
                .expect(statusCode)
            await sleep(200)
            if (res.accepted) {
                await request(server)
                    .post('/api/books/delete/' + mockBook.nameBook + role)
                    .expect(200)
            }
        })
        test.each([
            ['Admin', adminUser],
            ['User', noAdminUser],
        ])('%s default permission', async (role, user) => {
            let jwtToken = await getJwtToken(user)
            await request(server)
                .get('/api/user/me')
                .set('authorization', jwtToken)
                .expect(200)
                .then(async (res) => {
                    let body = res.body as JwtPayload
                    let foundedUser = await userService.findUser({
                        id: body.userId,
                    })
                    expect(body).toStrictEqual({
                        userId: foundedUser.id,
                        roles: foundedUser.role,
                        email: foundedUser.email,
                    })
                })
        })
    })

    describe('users without jwt', () => {
        test.each([
            ['admin', '/api/books/create', 'post'],
            ['default', '/api/user/me', 'get'],
        ])('user forbidden to %s resource', async (role, path, method) => {
            await request(server)[method](path).expect(401)
        })
        test.each([
            ['admin', '/api/books/create', 'post'],
            ['default', '/api/user/me', 'get'],
        ])('user with fake jwt to %s resource', async (role, path, method) => {
            await request(server)
                [method](path)
                .set('authorization', 'bearer ' + fakeJwt)
                .expect(401)
        })
    })
})
