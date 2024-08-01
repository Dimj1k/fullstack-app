import {
    Body,
    Controller,
    HttpException,
    HttpStatus,
    Post,
} from '@nestjs/common'
import { UserService } from './user.service'
import { PasswordConfirmRemover } from '../pipes/password-confirm-remover.pipe'
import { PasswordHasher } from '../pipes/password-hasher.pipe'
import { CreateUserDto } from '../dto/create-user.dto'
import { CreateUserService } from './create-user.service'
import { RegisterToken } from '../dto/register-token.dto'
import { User } from '../entities/user/user.entity'
import { BirthdayDateCheck } from '../pipes/birthday-date-check.pipe'

export type UserFromMongo = Pick<User, 'email' | 'password' | 'info'>

@Controller('user')
export class UserController {
    constructor(
        private readonly createUserService: CreateUserService,
        private readonly userService: UserService,
    ) {}

    @Post('/create')
    async create(
        @Body(PasswordConfirmRemover, PasswordHasher, BirthdayDateCheck)
        createUserDto: CreateUserDto,
    ) {
        let foundedUser = await this.userService.findUser({
            email: createUserDto.email,
        })
        if (foundedUser)
            throw new HttpException('user is exists', HttpStatus.BAD_REQUEST)
        return this.createUserService.createInCacheUser(createUserDto)
    }

    @Post('/create/confirm')
    async confirmRegistration(@Body() token: RegisterToken) {
        let confirmedUser =
            await this.createUserService.returnByTokenUser(token)
        confirmedUser.subscribe((user: UserFromMongo) => {
            this.userService.createUser(user)
        })
    }
}
