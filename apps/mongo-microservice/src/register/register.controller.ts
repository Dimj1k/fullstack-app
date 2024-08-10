import {
    ClassSerializerInterceptor,
    Injectable,
    UseInterceptors,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common'
import { RegisterService } from './register.service'
import { GrpcMethod } from '@nestjs/microservices'
import { CreateUserDto } from '../dtos'
import { Metadata, ServerUnaryCall } from '@grpc/grpc-js'
import { CacheUser } from './register.entity'
import { RegisterCodeDto } from '../dtos'

@UsePipes(
    new ValidationPipe({
        whitelist: true,
        transform: true,
    }),
)
@Injectable()
export class RegisterController {
    constructor(private readonly registerService: RegisterService) {}

    @GrpcMethod('RegisterController', 'createInCacheUser')
    async createInCacheUser(
        data: CreateUserDto,
        metadata: Metadata,
        call: ServerUnaryCall<any, any>,
    ): Promise<RegisterCodeDto> {
        return this.registerService.createInCacheUser(data)
    }

    @UseInterceptors(ClassSerializerInterceptor)
    @GrpcMethod('RegisterController', 'returnByTokenUser')
    async returnByTokenUser(
        code: RegisterCodeDto,
        metadata: Metadata,
        call: ServerUnaryCall<any, any>,
    ): Promise<Omit<CacheUser, 'code' | 'createdAt'>> {
        return new CacheUser(await this.registerService.deleteByCodeUser(code))
    }
}
