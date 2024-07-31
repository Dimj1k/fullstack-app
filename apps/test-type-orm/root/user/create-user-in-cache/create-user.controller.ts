import {
    Body,
    Controller,
    Post,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common'
import { CreateUserDto } from '../dto/create-user.dto'
import { CreateUserService } from './create-user.service'
import { hash } from 'bcrypt'

@Controller('create-users')
export class CreateUserController {
    constructor(private readonly createUserService: CreateUserService) {}

    @Post('/cache')
    async create(@Body() createUserDto: CreateUserDto) {
        delete createUserDto.passwordConfirm
        createUserDto.password = await hash(createUserDto.password, 10)
        return this.createUserService.createInCacheUser(createUserDto)
    }
}
