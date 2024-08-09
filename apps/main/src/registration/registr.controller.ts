import {
    BadRequestException,
    Body,
    Catch,
    ConflictException,
    Controller,
    NotFoundException,
    Post,
    Res,
} from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
import { RegisterCode } from './dto/register-token.dto'
import { RegistrService } from './registr.service'
import { MyMailerService } from '../mailer/mailer.service'
import { PasswordHasher } from '../pipes/password-hasher.pipe'
import { BirthdayDateCheck } from '../pipes/birthday-date-check.pipe'
import { PasswordConfirmRemover } from '../pipes/password-confirm-remover.pipe'
import { UserFromMongo } from '../user/user.controller'
import { UserService } from '../user/user.service'
import { ApiTags } from '@nestjs/swagger'
import { RpcException } from '@nestjs/microservices'
import { Response } from 'express'

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
        @Res() response: Response,
    ) {
        let foundedUser = await this.userService.findUser({
            email: createUserDto.email,
        })
        if (foundedUser) throw new ConflictException("user's exists")
        let registerCode =
            await this.createUserService.createInCacheUser(createUserDto)
        registerCode.subscribe((code) => {
            this.mailService.sendMail(
                createUserDto.email,
                'Код для регистрации',
                `Ваш код для регистарции:\n${JSON.stringify(code)}`,
            )
            response.json({
                message:
                    'Если почта существует - Вы получите сообщение с кодом',
            })
        })
    }

    @Post('/confirm')
    async registrationConfirm(
        @Body() token: RegisterCode,
        @Res() response: Response,
    ) {
        let confirmedUser =
            await this.createUserService.returnByTokenUser(token)
        confirmedUser.subscribe((res: UserFromMongo) => {
            this.userService.createUser(res)
            response.set(201).json({ success: 'Вы успешно зарегистрировались' })
        })
    }
}
