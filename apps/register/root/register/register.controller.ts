import {
    ClassSerializerInterceptor,
    Controller,
    UseInterceptors,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common'
import { RegisterService } from './register.service'
import { GrpcMethod } from '@nestjs/microservices'
import { CreateUserDto } from '../dtos/create-user.dto'
import { Metadata, ServerUnaryCall } from '@grpc/grpc-js'
import { CacheUser } from './register.entity'
import { RegisterTokenDto } from '../dtos/register-token.dto'

@UsePipes(new ValidationPipe())
@Controller()
export class RegisterController {
    constructor(private readonly registerService: RegisterService) {}

    @GrpcMethod('RegisterController', 'createInCacheUser')
    async createInCacheUser(
        data: CreateUserDto,
        metadata: Metadata,
        call: ServerUnaryCall<any, any>,
    ): Promise<RegisterTokenDto> {
        return this.registerService.createInCacheUser(data)
    }

    @UseInterceptors(ClassSerializerInterceptor)
    @GrpcMethod('RegisterController', 'returnByTokenUser')
    async returnByTokenUser(
        token: RegisterTokenDto,
        metadata: Metadata,
        call: ServerUnaryCall<any, any>,
    ): Promise<Omit<CacheUser, 'token' | 'createdAt'>> {
        return new CacheUser(
            await this.registerService.deleteByTokenUser(token),
        )
    }
}
