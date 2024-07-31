import {
    Body,
    Controller,
    Post,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common'
import { CreateUserDto } from '../dto/create-user.dto'
import { CreateUserService } from './create-user.service'

@Controller('create-users')
export class CreateUserController {
    constructor(private readonly createUserService: CreateUserService) {}

    @UsePipes(new ValidationPipe())
    @Post('/cache')
    create(@Body() createCreateUserDto: CreateUserDto) {
        delete createCreateUserDto.passwordConfirm
        return this.createUserService.createInCacheUser(createCreateUserDto)
    }
}
