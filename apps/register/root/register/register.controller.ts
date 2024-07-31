import { Controller, UsePipes, ValidationPipe } from '@nestjs/common'
import { RegisterService } from './register.service'
import { GrpcMethod } from '@nestjs/microservices'
import { CreateUserDto } from './dtos/create-user.dto'
import { Metadata, ServerUnaryCall } from '@grpc/grpc-js'

@Controller()
export class RegisterController {
    constructor(private readonly registerService: RegisterService) {}

    @UsePipes(new ValidationPipe())
    @GrpcMethod('RegisterController', 'createInCacheUser')
    createInCacheUser(
        data: CreateUserDto,
        metadata: Metadata,
        call: ServerUnaryCall<any, any>,
    ) {
        console.log(data)
        return this.registerService.createInCacheUser(data)
    }
}
