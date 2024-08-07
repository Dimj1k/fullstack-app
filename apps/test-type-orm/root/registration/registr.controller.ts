import {
    BadRequestException,
    Body,
    Catch,
    ConflictException,
    Controller,
    NotFoundException,
    Post,
} from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
import { RegisterCode } from './dto/register-token.dto'
import { RegistrService } from './registr.service'
import { MyMailerService } from '../mailer/mailer.service'
import { PasswordHasher } from '../pipes/password-hasher.pipe'
import { catchError, lastValueFrom, NotFoundError, take, timeout } from 'rxjs'
import { BirthdayDateCheck } from '../pipes/birthday-date-check.pipe'
import { PasswordConfirmRemover } from '../pipes/password-confirm-remover.pipe'
import { UserFromMongo } from '../user/user.controller'
import { UserService } from '../user/user.service'
import { ApiTags } from '@nestjs/swagger'
import { RpcException } from '@nestjs/microservices'

@Catch(RpcException)
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

        let code = await lastValueFrom(
            registerCode.pipe(
                take(1),
                catchError((err) => {
                    throw err || new BadRequestException()
                }),
                timeout(5000),
            ),
        )
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
        await confirmedUser
            .forEach((res: UserFromMongo) => {
                this.userService.createUser(res)
            })
            .catch((err) => {
                throw new NotFoundException(err)
            })
        return { success: 'Вы успешно зарегистрировались' }
    }
}
