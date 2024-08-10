import { INestApplication, ValidationPipe } from '@nestjs/common'
import { TestingModule, Test } from '@nestjs/testing'
import { TypeOrmModule } from '@nestjs/typeorm'
import * as cookieParser from 'cookie-parser'
import { DataSource } from 'typeorm'
import { AdminService } from '../src/administration'
import { AppModule } from '../src/app.module'
import { POSTGRES_ENTITIES } from '../src/entities'
import { RegistrService } from '../src/registration'
import { UserService } from '../src/user'
import { bookCreator, password, bookReceiver } from './mocks'
import { Db, MongoClient } from 'mongodb'

let app: INestApplication
let connection: MongoClient
let mongo: Db
let pg: DataSource
let server: any
let userService: UserService
beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule, TypeOrmModule.forFeature(POSTGRES_ENTITIES)],
        providers: [RegistrService, AdminService],
    }).compile()
    let registrationService = moduleFixture.get<RegistrService>(RegistrService)
    userService = moduleFixture.get<UserService>(UserService)
    let [{ email }] = await Promise.all([
        registrationService.createUserInSql({ ...bookCreator, password }),
        registrationService.createUserInSql({ ...bookReceiver, password }),
    ])
    let adminService = moduleFixture.get<AdminService>(AdminService)
    await adminService.upgradeToAdmin(email)
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
        // pg
        //     .createQueryBuilder()
        //     .delete()
        //     .from('users')
        //     .where('users.email = any (:emails)', {
        //         emails: [registrationUserSuccess.email, secondUser.email],
        //     })
        //     .execute(),
        // mongo.collection('cache_user').deleteMany({}),
    ])
    await Promise.all([pg.destroy(), connection.close()])
})

describe('Book creating (e2e)', () => {
    test('test', () => {})
})
