import { NestFactory } from '@nestjs/core'
import { GrpcOptions, Transport } from '@nestjs/microservices'
import { join } from 'path'
import { AppClusterService } from './cluster.service'
import { AppModule } from './app.module'

async function bootstrap() {
    const app = await NestFactory.createMicroservice<GrpcOptions>(AppModule, {
        transport: Transport.GRPC,
        options: {
            url: 'localhost:3001',
            package: 'register',
            protoPath: join(
                __dirname,
                'register',
                'protos',
                'register-service.proto',
            ),
        },
    })
    await app.listen()
}
AppClusterService.clusterize(bootstrap, 2)
