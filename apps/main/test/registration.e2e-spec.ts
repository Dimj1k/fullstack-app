import * as request from 'supertest'
import * as cookieParser from 'cookie-parser'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import { TestingModule, Test } from '@nestjs/testing'
import { addDays } from 'date-fns'
import { DataSource } from 'typeorm'
import { AppModule } from '../src/app.module'
import { POSTGRES_ENTITIES } from '../src/entities'
import { User } from '../src/entities/user'
import {
    registrationUserSuccess,
    secondUser,
    registrationUserFail,
} from './mocks'
import { sleep } from './utils'
import { Db, MongoClient } from 'mongodb'

let app: INestApplication
let connection: MongoClient
let mongo: Db
let pg: DataSource
let server: any
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
                emails: [registrationUserSuccess.email, secondUser.email],
            })
            .execute(),
        mongo.collection('cache_user').deleteMany({}),
    ])
    await Promise.all([pg.destroy(), connection.close()])
})

describe('UserRegistration (e2e)', () => {
    test(`Registration User - success`, async () => {
        await request(server)
            .post('/api/registration')
            .send(registrationUserSuccess)
            .expect(201, {
                message:
                    'Если почта существует - Вы получите сообщение с кодом',
            })
        let { code } = await mongo.collection('cache_user').findOne({
            email: registrationUserSuccess.email,
        })
        await request(server)
            .post('/api/registration/confirm')
            .send({ code })
            .expect(201, { success: 'Вы успешно зарегистрировались' })
        await sleep(100)
        expect(
            await pg.getRepository(User).findOneOrFail({
                where: { email: registrationUserSuccess.email },
            }),
        ).toBeDefined()
    })

    test(`Registration User - error`, async () => {
        await request(server)
            .post('/api/registration')
            .send(registrationUserFail)
            .expect(400, {
                message: [
                    '(user) => user.password and passwordConfirm does not match',
                ],
                error: 'Bad Request',
                statusCode: 400,
            })
        await request(server)
            .post('/api/registration')
            .send({
                ...registrationUserSuccess,
                email: 'asad@email.el',
                info: { birthdayDate: addDays(new Date(), 5) },
            })
            .expect(400)
        await request(server)
            .post('/api/registration')
            .send({
                ...registrationUserFail,
                passwordConfirm: registrationUserFail.password,
                info: {
                    gender: 3,
                },
            })
            .expect(400, {
                message: [
                    'info.gender must be one of the following values: 0, 1, 2',
                ],
                error: 'Bad Request',
                statusCode: 400,
            })
        await request(server)
            .post('/api/registration')
            .send(secondUser)
            .expect(201)
        let { code } = await mongo
            .collection('cache_user')
            .findOne({ email: secondUser.email })
        await request(server)
            .post('/api/registration/confirm')
            .send({ code })
            .expect(201)
        await request(server)
            .post('/api/registration')
            .send(secondUser)
            .expect(409, {
                message: "user's exists",
                error: 'Conflict',
                statusCode: 409,
            })
    })
})
