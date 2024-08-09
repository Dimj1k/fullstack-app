import {
    BadRequestException,
    Body,
    Catch,
    ConflictException,
    Controller,
    NotFoundException,
    Post,
    Res,
    UseInterceptors,
} from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
import { RegisterCode } from './dto/register-token.dto'
import { RegistrService } from './registr.service'
import { PasswordHasher } from '../pipes/password-hasher.pipe'
import { BirthdayDateCheck } from '../pipes/birthday-date-check.pipe'
import { PasswordConfirmRemover } from '../pipes/password-confirm-remover.pipe'
import { UserService } from '../user/user.service'
import { ApiTags } from '@nestjs/swagger'
import { TimeoutInterceptor } from '../interceptors/timeout.interceptor'
import { MailerInterceptor } from '../interceptors/mailer.interceptor'
import { TypeMails } from '../mailer/type-mails.types'
import { IMail } from '../mailer/mailer.service'
import { Response } from 'express'

@UseInterceptors(TimeoutInterceptor)
@ApiTags('registration')
@Controller('registration')
export class RegistrController {
    constructor(
        private readonly createUserService: RegistrService,
        private readonly userService: UserService,
    ) {}

    @UseInterceptors(MailerInterceptor)
    @Post()
    async registration(
        @Body(PasswordHasher, PasswordConfirmRemover, BirthdayDateCheck)
        createUserDto: CreateUserDto,
    ): Promise<IMail> {
        let foundedUser = await this.userService.findUser({
            email: createUserDto.email,
        })
        if (foundedUser) throw new ConflictException("user's exists")
        let registerCode =
            await this.createUserService.createInCacheUser(createUserDto)
        // registerCode.subscribe((code) => {
        return {
            to: createUserDto.email,
            type: TypeMails.REGISTRATION_CODE,
            content: { code: registerCode.code },
        }
        // })
    }

    @Post('/confirm')
    async registrationConfirm(@Body() token: RegisterCode) {
        let confirmedUser =
            await this.createUserService.returnByTokenUser(token)
        // confirmedUser.subscribe((res: UserFromMongo) => {
        this.userService.createUser(confirmedUser)
        return { success: 'Вы успешно зарегистрировались' }
        // })
    }
}
