import { Injectable, OnModuleInit } from '@nestjs/common'
import { CreateUserDto } from '../dto/user/create-user.dto'
import { Client, ClientGrpc, Transport } from '@nestjs/microservices'
import { RegisterController } from '../interfaces/register-controller.interface'
import { join } from 'path'
import { Metadata } from '@grpc/grpc-js'
import { RegisterToken } from '../dto/user/register-token.dto'

@Injectable()
export class CreateUserService implements OnModuleInit {
    private registerService: RegisterController
    @Client({
        transport: Transport.GRPC,
        options: {
            url: 'localhost:3001',
            package: 'register',
            protoPath: join(__dirname, 'protos', 'register-service.proto'),
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

    async returnByTokenUser(token: RegisterToken) {
        return this.registerService.returnByTokenUser(token)
    }
}
