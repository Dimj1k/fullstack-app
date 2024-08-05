import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import * as GRPC from '@grpc/grpc-js'
import * as ProtoLoader from '@grpc/proto-loader'
import { AppModule } from '../root/app.module'
import {
    ClientGrpcProxy,
    MicroserviceOptions,
    Transport,
} from '@nestjs/microservices'
import { join } from 'path'

describe('UserRegistration (e2e)', () => {
    let app: INestApplication
    let client: ClientGrpcProxy

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile()

        app = moduleFixture.createNestApplication()

        app.connectMicroservice<MicroserviceOptions>({
            transport: Transport.GRPC,
            options: {
                package: 'mongo',
                protoPath: [join(__dirname, 'mongo-service.proto')],
            },
        })

        await app.startAllMicroservices()
        await app.init()

        // const proto = ProtoLoader.loadSync(
        //     join(__dirname, 'mongo-service.proto'),
        // ) as any
        // Create Raw gRPC client object
        // const protoGRPC = GRPC.loadPackageDefinition(proto)
        // Create client connected to started services at standard 5000 port
        // client = new protoGRPC.mongo.Mongo(
        //     'localhost:3001',
        //     GRPC.credentials.createInsecure(),
        // )
    })

    test(`GRPC Sending and Receiving`, async () => {
        await request(app.getHttpServer())
            .post('/user/registration')
            .send({
                email: '123@123.ru',
                password: '123',
                passwordConfirm: '123',
            })
            .expect({
                message:
                    'Если почта существует - Вы получите сообщение с кодом',
            })
    })

    // afterAll(async () => {
    //     await app.close()
    // })
})
