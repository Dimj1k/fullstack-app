import { INestApplication, ValidationPipe } from '@nestjs/common'
import { TestingModule, Test } from '@nestjs/testing'
import * as cookieParser from 'cookie-parser'
import * as request from 'supertest'
import { DataSource } from 'typeorm'
import { AdminService } from '../src/administration'
import { AppModule } from '../src/app.module'
import { POSTGRES_ENTITIES } from '../src/shared/entities'
import { RegistrService } from '../src/registration'
import {
    bookCreator,
    password,
    bookReceiver,
    MockMailer,
    mockBook1,
    users,
    mockBook2,
} from './mocks'
import * as QueryString from 'qs'
import { MONGO_ENTITIES, Token } from './mongo-entities'
import { ConfigService } from '@nestjs/config'
import { BooksService } from '../src/books'
import { map } from 'async'
import { AuthDto } from '../src/auth/dto'
import { join } from 'node:path'
import { rm } from 'node:fs'

let jwtTokens: string[]
let app: INestApplication
let mongo: DataSource
let pg: DataSource
let server: any
const mockImage = join(__dirname, 'mocks', 'image-book1.mock.png')
beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
    })
        .overrideProvider('Mailer')
        .useClass(MockMailer)
        .compile()
    let registrationService = moduleFixture.get<RegistrService>(RegistrService)
    let bookService = moduleFixture.get(BooksService)
    let [{ email }, , { bookId }] = await Promise.all([
        registrationService.createUserInSql({ ...bookCreator, password }),
        registrationService.createUserInSql({ ...bookReceiver, password }),
        bookService.create(mockBook1),
        bookService.create(mockBook2),
    ])
    mockBook1.bookId = bookId
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

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
    app.setGlobalPrefix('api')
    app.use(cookieParser())

    await app.init()

    server = app.getHttpServer()
    jwtTokens = await map(users, async (user: AuthDto) =>
        request(server)
            .post('/api/auth/login')
            .send(user)
            .set('user-agent', 'bookTest')
            .expect(200)
            .then((res) => res.body.accessToken),
    )
})

describe('find-all books', () => {
    test(`find-all books - successful`, async () => {
        let oldLength = (
            await request(server).get('/api/books/find-all').expect(200)
        ).body.length
        let qs = QueryString.stringify({ take: 1 }, { addQueryPrefix: true })
        expect(
            (await request(server).get(`/api/books/find-all${qs}`).expect(200))
                .body.length,
        ).toEqual(+QueryString.parse(qs, { ignoreQueryPrefix: true }).take)
        qs = QueryString.stringify({ skip: 2 }, { addQueryPrefix: true })
        expect(
            (await request(server).get(`/api/books/find-all${qs}`).expect(200))
                .body.length,
        ).toBeLessThan(oldLength)
    })
    test('find-all books - fail', async () => {
        let qs = QueryString.stringify({ take: -1 }, { addQueryPrefix: true })
        await request(server).get(`/api/books/find-all${qs}`).expect(400)
        qs = QueryString.stringify({ skip: -1 }, { addQueryPrefix: true })
        await request(server).get(`/api/books/find-all${qs}`).expect(400)
        qs = QueryString.stringify({ take: 502 }, { addQueryPrefix: true })
        await request(server).get(`/api/books/find-all${qs}`).expect(400)
        qs = QueryString.stringify(
            { take: 502, skip: 3 },
            { addQueryPrefix: true },
        )
        await request(server).get(`/api/books/find-all${qs}`).expect(400)
        qs = QueryString.stringify(
            { take: 1, skip: -1 },
            { addQueryPrefix: true },
        )
        await request(server).get(`/api/books/find-all${qs}`).expect(400)
    })
    test('find-all books by genre', async () => {
        let qs = QueryString.stringify(
            { genre: ['mock'] },
            { addQueryPrefix: true },
        )
        await request(server)
            .get(`/api/books/find-all${qs}`)
            .expect(200)
            .then((res) => expect(res.body[0].genre).toContain('mock'))
        qs = QueryString.stringify(
            { genre: ['$_teeeeeeeeeeeest_$'] },
            { addQueryPrefix: true },
        )
        await request(server)
            .get(`/api/books/find-all${qs}`)
            .expect(200)
            .then((res) => expect(res.body.length).toBe(0))
    })
})

describe('update book', () => {
    test(`update ${mockBook1.nameBook} - successful`, async () => {
        await request(server)
            .patch(`/api/books/update/${mockBook1.bookId}`)
            .set('authorization', jwtTokens[0])
            .field('genre', ['a', 'd'])
            .attach('image', mockImage)
            .expect(200)
        mockBook1.genre = ['a', 'd']
    })
    test(`update ${mockBook1.nameBook} - fail`, async () => {
        await request(server)
            .patch(`/api/books/update/${mockBook1.bookId}`)
            .set('authorization', jwtTokens[0])
            .send({
                description: mockBook1.description,
                genre: mockBook1.genre,
            })
            .expect(400, {
                message: 'Вы ничего не меняете',
                statusCode: 400,
                error: 'Bad Request',
            })
    })
})

describe('add-to-yourself book', () => {
    test('test', async () => {
        await request(server)
            .post(`/api/user-book/add-to-yourself/${mockBook1.nameBook}`)
            .set('authorization', jwtTokens[0])
            .expect(200)
        await request(server)
            .post(`/api/user-book/add-to-yourself/${mockBook1.nameBook}`)
            .set('authorization', jwtTokens[0])
            .expect(400)
    })
})

describe(`Concurrent add-to-yourself/${mockBook2.nameBook}`, () => {
    test.concurrent(
        `add-to-yourself/${mockBook2.nameBook} user 1`,
        async () => {
            await request(server)
                .post(`/api/user-book/add-to-yourself/${mockBook2.nameBook}`)
                .set('authorization', jwtTokens[0])
                .expect(200)
        },
    )
    test.concurrent(
        `add-to-yourself/${mockBook2.nameBook} user 2`,
        async () => {
            await request(server)
                .post(`/api/user-book/add-to-yourself/${mockBook2.nameBook}`)
                .set('authorization', jwtTokens[1])
                .expect(200)
        },
    )
    afterAll(async () => {
        expect(
            (
                await request(server).get(
                    `/api/books/get-one/${mockBook2.nameBook}`,
                )
            ).body.likes,
        ).toEqual(`${jwtTokens.length}`)
    })
})

afterAll(async () => {
    await Promise.all([
        pg
            .createQueryBuilder()
            .delete()
            .from('users')
            .where('users.email = any (:emails)', {
                emails: users.map((u) => u.email),
            })
            .execute(),
        pg
            .createQueryBuilder()
            .delete()
            .from('books')
            .where('books.name_book = any (:nameBooks)', {
                nameBooks: [mockBook1.nameBook, mockBook2.nameBook],
            })
            .execute(),
        mongo.getMongoRepository(Token).deleteMany({ userAgent: 'bookTest' }),
    ])
    rm(join(__dirname, '..', 'uploads'), { recursive: true }, () => null)
    await Promise.all([pg.destroy(), mongo.destroy()])
    await app.close()
})
