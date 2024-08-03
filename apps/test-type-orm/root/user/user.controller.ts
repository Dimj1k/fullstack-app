import {
    Body,
    ClassSerializerInterceptor,
    ConflictException,
    Controller,
    Delete,
    Param,
    Patch,
    Post,
    UseInterceptors,
} from '@nestjs/common'
import { UserService } from './user.service'
import { PasswordConfirmRemover } from '../pipes/password-confirm-remover.pipe'
import { PasswordHasher } from '../pipes/password-hasher.pipe'
import { CreateUserDto } from './dto/create-user.dto'
import { CreateUserService } from './create-user.service'
import { RegisterCode } from './dto/register-token.dto'
import { User, UserInfo } from '../entities/user/user.entity'
import { BirthdayDateCheck } from '../pipes/birthday-date-check.pipe'
import { UUID } from 'crypto'
import { UpdateUserDto } from './dto/update-user.dto'

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
        if (foundedUser) throw new ConflictException("user's exists")
        return this.createUserService.createInCacheUser(createUserDto)
    }

    @Post('/registration/confirm')
    async registrationConfirm(@Body() token: RegisterCode) {
        let confirmedUser =
            await this.createUserService.returnByTokenUser(token)
        confirmedUser.forEach(async (res: UserFromMongo) => {
            this.userService.createUser(res)
        })
        return { success: 'Вы успешно зарегистрировались' }
    }

    @UseInterceptors(ClassSerializerInterceptor)
    @Patch('/update/:id')
    async updateUser(
        @Param('id') id: UUID,
        @Body() updateUserDto: UpdateUserDto,
    ) {
        return this.userService.updateUser(id, updateUserDto)
    }

    @Delete('/delete/:id')
    async deleteUser(@Param('id') id: UUID) {
        this.userService.deleteById(id)
    }
}
