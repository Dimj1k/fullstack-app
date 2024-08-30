import * as request from 'supertest'
import * as cookieParser from 'cookie-parser'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { NestExpressApplication } from '@nestjs/platform-express'
import { TestingModule, Test } from '@nestjs/testing'
import { DataSource } from 'typeorm'
import { AdminService } from '../src/administration'
import { AppModule } from '../src/app.module'
import { POSTGRES_ENTITIES } from '../src/shared/entities'
import { ROLE } from '../src/shared/entities/user'
import { JwtPayload } from '../src/shared/interfaces'
import { RegistrService } from '../src/registration'
import { UserService } from '../src/user'
import { TypeUser } from './login.e2e-spec'
import {
    adminUser,
    password,
    noAdminUser,
    permissionBook,
    MockMailer,
} from './mocks'
import { sleep } from './utils'
import { MONGO_ENTITIES, Token } from './mongo-entities'
import { fakeJwt } from './mocks/fakeJwt.json'
import { ConfigService } from '@nestjs/config'

let app: INestApplication
let mongo: DataSource
let pg: DataSource
let jwtService: JwtService
let server: any
let userService: UserService
beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
    })
        .overrideProvider('Mailer')
        .useClass(MockMailer)
        .compile()
    let registrationService = moduleFixture.get<RegistrService>(RegistrService)
    userService = moduleFixture.get<UserService>(UserService)
    let [{ email }, _] = await Promise.all([
        registrationService.createUserInSql({ ...adminUser, password }),
        registrationService.createUserInSql({ ...noAdminUser, password }),
    ])
    let adminService = moduleFixture.get<AdminService>(AdminService)
    await adminService.upgradeToAdmin(email)
    let configService = moduleFixture.get(ConfigService)
    mongo = await new DataSource({
        type: 'mongodb',
        host: 'localhost',
        port: 27017,
        database: 'test',
        entities: MONGO_ENTITIES,
    }).initialize()
    pg = await new DataSource({
        type: configService.get<'postgres'>('TYPEORM_DRIVER'),
        host: configService.get('TYPEORM_HOST'),
        port: configService.get('TYPEORM_PORT'),
        username: configService.get('TYPEORM_USERNAME'),
        password: configService.get('TYPEORM_PASSWORD'),
        database: configService.get<string>('TYPEORM_DATABASE'),
        entities: POSTGRES_ENTITIES,
    }).initialize()

    app = moduleFixture.createNestApplication<NestExpressApplication>()
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
    app.setGlobalPrefix('api')
    app.use(cookieParser())

    await app.startAllMicroservices()
    await app.init()
    jwtService = moduleFixture.get<JwtService>(JwtService)

    server = app.getHttpServer()
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
                    permissionBook.nameBook + 'Admin',
                    permissionBook.nameBook + 'User',
                ],
            })
            .execute(),
        mongo
            .getMongoRepository(Token)
            .deleteMany({ userAgent: 'permissionTest' }),
    ])
    await Promise.all([pg.destroy(), mongo.destroy()])
    await app.close()
})

async function getJwtToken(user: TypeUser): Promise<string>
async function getJwtToken(
    user: TypeUser,
    withType: true,
): Promise<[string, string]>
async function getJwtToken(user: TypeUser, withType = false) {
    let accessToken = (
        await request(server)
            .post('/api/auth/login')
            .set('user-agent', 'permissionTest')
            .send(user)
            .expect(200)
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
                .send({
                    ...permissionBook,
                    nameBook: permissionBook.nameBook + role,
                })
                .expect(statusCode)
            if (res.accepted) {
                await request(server)
                    .post('/api/books/delete/' + permissionBook.nameBook + role)
                    .expect(200)
            }
        })
        test.each([
            ['Admin', adminUser],
            ['User', noAdminUser],
        ])('%s default permission', async (role, user) => {
            let jwtToken = await getJwtToken(user)
            await request(server)
                .get('/api/users/me')
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
            ['default', '/api/users/me', 'get'],
        ])('user forbidden to %s resource', async (role, path, method) => {
            await request(server)[method](path).expect(401)
        })
        test.each([
            ['admin', '/api/books/create', 'post'],
            ['default', '/api/users/me', 'get'],
        ])('user with fake jwt to %s resource', async (role, path, method) => {
            await request(server)
                [method](path)
                .set('authorization', 'Bearer ' + fakeJwt)
                .expect(401)
        })
    })
})
