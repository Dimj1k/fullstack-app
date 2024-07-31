import { Injectable, OnModuleInit } from '@nestjs/common'
import { CreateUserDto } from '../dto/create-user.dto'
import { Client, ClientGrpc, Transport } from '@nestjs/microservices'
import { RegisterController } from '../interfaces/register-controller.interface'
import { join } from 'path'

@Injectable()
export class CreateUserService implements OnModuleInit {
    private registerService: RegisterController
    @Client({
        transport: Transport.GRPC,
        options: {
            url: 'localhost:3001',
            package: 'register',
            protoPath: join(
                __dirname,
                'user',
                'protos',
                'register-service.proto',
            ),
        },
    })
    client: ClientGrpc

    onModuleInit() {
        this.registerService =
            this.client.getService<RegisterController>('RegisterController')
    }

    async createInCacheUser(createCreateUserDto: CreateUserDto) {
        return this.registerService.createInCacheUser(createCreateUserDto)
    }
}
