import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from '../root/app.module'
import {
    registrationUserFail,
    registrationUserSuccess,
} from './mocks/registration-user.mock'
import { DataSource } from 'typeorm'
import { addDays } from 'date-fns'
import { Db, MongoClient } from 'mongodb'
import { User, UserInfo } from '../root/entities/user/user.entity'
import { POSTGRES_ENTITIES } from '../root/entities'

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
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }))

    await app.startAllMicroservices()
    await app.init()

    server = app.getHttpServer()
})

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

describe('UserRegistration (e2e)', () => {
    test(`Registration User - success`, async () => {
        await request(server)
            .post('/registration')
            .send(registrationUserSuccess)
            .expect(201, {
                message:
                    'Если почта существует - Вы получите сообщение с кодом',
            })
        let { code } = await mongo.collection('cache_user').findOne({
            email: registrationUserSuccess.email,
        })
        await request(server)
            .post('/registration/confirm')
            .send({ code })
            .timeout(100)
            .expect(201, { success: 'Вы успешно зарегистрировались' })
        await sleep(100)
        expect(
            await pg.getRepository(User).findOneOrFail({
                where: { email: registrationUserSuccess.email },
                withDeleted: true,
            }),
        ).toBeDefined()
    })

    test(`Registration User - error`, async () => {
        await request(server)
            .post('/registration')
            .send(registrationUserFail)
            .expect(400, {
                message: [
                    '(user) => user.password and passwordConfirm does not match',
                ],
                error: 'Bad Request',
                statusCode: 400,
            })
        await request(server)
            .post('/registration')
            .send({
                ...registrationUserSuccess,
                email: 'asad@email.el',
                info: { birthdayDate: addDays(new Date(), 5) },
            })
            .expect(400)
        await request(server)
            .post('/registration')
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
            .post('/registration')
            .send(registrationUserSuccess)
            .expect(409, {
                message: "user's exists",
                error: 'Conflict',
                statusCode: 409,
            })
    })

    afterAll(async () => {
        await pg
            .createQueryBuilder()
            .delete()
            .from('users')
            .where('users.email = :email', {
                email: registrationUserSuccess.email,
            })
            .execute()
        await Promise.all([mongo.collection('cache_user').deleteMany({})])
        await Promise.all([pg.destroy(), connection.close()])
        await app.close()
    })
})
