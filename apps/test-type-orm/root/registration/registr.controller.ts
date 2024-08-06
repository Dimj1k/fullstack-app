import {
    Body,
    Catch,
    ConflictException,
    Controller,
    Post,
} from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
import { RegisterCode } from './dto/register-token.dto'
import { RegistrService } from './registr.service'
import { MyMailerService } from '../mailer/mailer.service'
import { PasswordHasher } from '../pipes/password-hasher.pipe'
import { lastValueFrom, take } from 'rxjs'
import { BirthdayDateCheck } from '../pipes/birthday-date-check.pipe'
import { PasswordConfirmRemover } from '../pipes/password-confirm-remover.pipe'
import { UserFromMongo } from '../user/user.controller'
import { UserService } from '../user/user.service'
import { ApiTags } from '@nestjs/swagger'

@ApiTags('registration')
@Controller('registration')
export class RegistrController {
    constructor(
        private readonly createUserService: RegistrService,
        private readonly mailService: MyMailerService,
        private readonly userService: UserService,
    ) {}

    @Post()
    async registration(
        @Body(PasswordHasher, PasswordConfirmRemover, BirthdayDateCheck)
        createUserDto: CreateUserDto,
    ) {
        let foundedUser = await this.userService.findUser({
            email: createUserDto.email,
        })
        if (foundedUser) throw new ConflictException("user's exists")
        let registerCode =
            await this.createUserService.createInCacheUser(createUserDto)
        let code = await lastValueFrom(registerCode.pipe(take(1)))
        this.mailService.sendMail(
            createUserDto.email,
            'Код для регистрации',
            `Ваш код для регистарции:\n${JSON.stringify(code)}`,
        )
        return {
            message: 'Если почта существует - Вы получите сообщение с кодом',
        }
    }

    @Post('/confirm')
    async registrationConfirm(@Body() token: RegisterCode) {
        let confirmedUser =
            await this.createUserService.returnByTokenUser(token)
        await confirmedUser.forEach((res: UserFromMongo) => {
            this.userService.createUser(res)
        })
        return { success: 'Вы успешно зарегистрировались' }
    }
}
