import {
    UseInterceptors,
    Controller,
    Post,
    Body,
    UseFilters,
    BadRequestException,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { MailerInterceptor } from '../shared/interceptors'
import { IMail, TypeMails } from '../mailer'
import {
    PasswordHasher,
    PasswordConfirmRemover,
    BirthdayDateCheck,
} from '../shared/pipes'
import { UserService } from '../user'
import { CreateUserDto, RegisterCode } from './dto'
import { RegistrService } from './registr.service'
import { OnlyHttpExceptionFilter } from '../shared/filters'
import { RpcExceptionFilter } from '../shared/filters'

@UseFilters(OnlyHttpExceptionFilter, RpcExceptionFilter)
@ApiTags('registration')
@Controller('registration')
export class RegistrController {
    constructor(
        private readonly registrationService: RegistrService,
        private readonly userService: UserService,
    ) {}

    @UseInterceptors(MailerInterceptor)
    @Post()
    async registration(
        @Body(PasswordHasher, PasswordConfirmRemover, BirthdayDateCheck)
        createUserDto: CreateUserDto,
    ): IMail {
        let foundedUser = await this.userService.findUser({
            email: createUserDto.email,
        })
        if (foundedUser)
            throw new BadRequestException(
                'Пользователь с данной электронной почтой уже существует',
            )
        let { code } =
            await this.registrationService.createInCacheUser(createUserDto)
        // registerCode.subscribe((code) => {
        return {
            to: createUserDto.email,
            type: TypeMails.REGISTRATION_CODE,
            content: { code },
        }
        // })
    }

    @Post('/confirm')
    async registrationConfirm(@Body() code: RegisterCode) {
        let confirmedUser =
            await this.registrationService.returnByCodeUser(code)
        // confirmedUser.subscribe((res: UserFromMongo) => {
        await this.registrationService.createUserInSql(confirmedUser)
        return { message: 'Вы успешно зарегистрировались' }
        // })
    }
}
