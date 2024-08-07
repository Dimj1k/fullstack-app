import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { RegisterModule } from '../src/register/register.module'
import { NestExpressApplication } from '@nestjs/platform-express'

describe('RegisterController (e2e)', () => {
    let app: INestApplication

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [RegisterModule],
        }).compile()

        app = moduleFixture.createNestApplication<NestExpressApplication>()
        await app.init()
    })

    it('/ (GET)', () => {
        return request(app.getHttpServer())
            .get('/')
            .expect(200)
            .expect('Hello World!')
    })
})
