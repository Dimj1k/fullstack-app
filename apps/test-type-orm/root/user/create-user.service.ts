import { Injectable, OnModuleInit } from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
import { Client, ClientGrpc, Transport } from '@nestjs/microservices'
import { RegisterController } from '../interfaces/register-controller.interface'
import { join } from 'path'
import { Metadata } from '@grpc/grpc-js'
import { RegisterCode } from './dto/register-token.dto'
import { MONGO_DB_LOCATION } from '../constants'

@Injectable()
export class CreateUserService implements OnModuleInit {
    private registerService: RegisterController
    @Client({
        transport: Transport.GRPC,
        options: {
            url: MONGO_DB_LOCATION,
            package: 'mongo',
            protoPath: join(__dirname, 'protos', 'mongo-service.proto'),
        },
    })
    client: ClientGrpc

    onModuleInit() {
        this.registerService =
            this.client.getService<RegisterController>('RegisterController')
    }

    async createInCacheUser(createUserDto: CreateUserDto, metadata?: Metadata) {
        return this.registerService.createInCacheUser(createUserDto)
    }

    async returnByTokenUser(token: RegisterCode) {
        return this.registerService.returnByTokenUser(token)
    }
}
