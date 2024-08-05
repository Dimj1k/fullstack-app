import {
    Body,
    Catch,
    ClassSerializerInterceptor,
    ConflictException,
    Controller,
    Delete,
    Get,
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
import { MyMailerService } from '../mailer/mailer.service'
import { RpcException } from '@nestjs/microservices'

export type UserFromMongo = Pick<User, 'email' | 'password' | 'info'>

@Catch(RpcException)
@Controller('user')
export class UserController {
    constructor(
        private readonly createUserService: CreateUserService,
        private readonly userService: UserService,
        private readonly mailService: MyMailerService,
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
        let registerCode = await this.createUserService
            .createInCacheUser(createUserDto)
            .catch((err) => {
                throw err
            })
        registerCode.subscribe((code) =>
            this.mailService
                .sendMail(
                    createUserDto.email,
                    'Код для регистрации',
                    `Ваш код для регистарции:\n${JSON.stringify(code)}`,
                )
                .catch((err) => {
                    throw new Error()
                }),
        )
        return {
            message: 'Если почта существует - Вы получите сообщение с кодом',
        }
    }

    @Post('/registration/confirm')
    async registrationConfirm(@Body() token: RegisterCode) {
        let confirmedUser =
            await this.createUserService.returnByTokenUser(token)
        confirmedUser.forEach((res: UserFromMongo) => {
            this.userService.createUser(res)
        })
        return { success: 'Вы успешно зарегистрировались' }
    }

    @Get('/:id')
    async findUser(@Param(':id') id: string) {
        return this.userService.findUser(
            { id },
            { relations: { books: true }, select: ['books'] },
        )
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
