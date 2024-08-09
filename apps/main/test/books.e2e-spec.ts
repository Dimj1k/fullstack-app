import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from '../src/app.module'
import {
    registrationUserSuccess,
    secondUser,
} from './mocks/registration-user.mock'
import { DataSource } from 'typeorm'
import { Db, MongoClient } from 'mongodb'
import { POSTGRES_ENTITIES } from '../src/entities'
import * as cookieParser from 'cookie-parser'
import { UserService } from '../src/user/user.service'
import { TypeOrmModule } from '@nestjs/typeorm'

let app: INestApplication
let connection: MongoClient
let mongo: Db
let pg: DataSource
let server: any
beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule, TypeOrmModule.forFeature(POSTGRES_ENTITIES)],
        providers: [UserService],
    }).compile()
    let userService = moduleFixture.get<UserService>(UserService)
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

describe('Book creating (e2e)', () => {})
