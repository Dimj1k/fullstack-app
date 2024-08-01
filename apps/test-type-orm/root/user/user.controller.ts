import {
    Body,
    Controller,
    Delete,
    HttpException,
    HttpStatus,
    Param,
    Patch,
    Post,
    UnauthorizedException,
} from '@nestjs/common'
import { UserService } from './user.service'
import { PasswordConfirmRemover } from '../pipes/password-confirm-remover.pipe'
import { PasswordHasher } from '../pipes/password-hasher.pipe'
import { CreateUserDto } from '../dto/user/create-user.dto'
import { CreateUserService } from './create-user.service'
import { RegisterToken } from '../dto/user/register-token.dto'
import { User } from '../entities/user/user.entity'
import { BirthdayDateCheck } from '../pipes/birthday-date-check.pipe'
import { UUID } from 'crypto'
import { UpdateUserDto } from '../dto/user/update-user.dto'

export type UserFromMongo = Pick<User, 'email' | 'password' | 'info'>

@Controller('user')
export class UserController {
    constructor(
        private readonly createUserService: CreateUserService,
        private readonly userService: UserService,
    ) {}

    @Post('/registration')
    async registration(
        @Body(PasswordHasher, PasswordConfirmRemover, BirthdayDateCheck)
        createUserDto: CreateUserDto,
    ) {
        let foundedUser = await this.userService.findUser({
            email: createUserDto.email,
        })
        if (foundedUser)
            throw new HttpException("users' exists", HttpStatus.BAD_REQUEST)
        return this.createUserService.createInCacheUser(createUserDto)
    }

    @Post('/registration/confirm')
    async registrationConfirm(@Body() token: RegisterToken) {
        let confirmedUser =
            await this.createUserService.returnByTokenUser(token)
        confirmedUser.subscribe((user: UserFromMongo) => {
            this.userService.createUser(user)
        })
    }

    @Patch('/update/:id')
    async updateUser(
        @Param('id') id: UUID,
        @Body() updateUserDto: UpdateUserDto,
    ) {
        if (updateUserDto.email)
            if (
                await this.userService.findUser({
                    email: updateUserDto.email,
                })
            )
                throw new UnauthorizedException('email is busy')
        return this.userService.updateUser(id, updateUserDto)
    }

    @Delete('/delete/:id')
    async deleteUser(@Param('id') id: UUID) {
        this.userService.deleteById(id)
    }
}
