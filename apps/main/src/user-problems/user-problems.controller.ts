import {
    BadRequestException,
    Body,
    Controller,
    Get,
    NotFoundException,
    Post,
    Query,
    Redirect,
    Res,
    UseFilters,
    UseInterceptors,
} from '@nestjs/common'
import { UserProblemsService } from './user-problems.service'
import { UUID } from 'node:crypto'
import { IMail, TypeMails } from '../mailer'
import { HOST, SECURE_COOKIES } from '../shared/constants'
import { GetCookie, UserResources } from '../shared/decorators'
import { MailerInterceptor } from '../shared/interceptors'
import { UuidPipe } from '../shared/pipes'
import { EmailDto, ChangePasswordDto } from '../user/dto/forgot-password.dto'
import * as QueryString from 'qs'
import { UserService } from '../user/user.service'
import { Response } from 'express'
import { EmailUrlDto } from './dto/email-url.dto'
import { ApiQuery, ApiTags } from '@nestjs/swagger'
import { JwtPayload } from '../shared/interfaces'
import {
    RegistrationExceptionFilter,
    RpcExceptionFilter,
} from '../shared/filters'

@UseFilters(RpcExceptionFilter, RegistrationExceptionFilter)
@ApiTags('user-problems')
@Controller('user-problems')
export class UserProblemsController {
    constructor(
        private readonly userProblemsService: UserProblemsService,
        private readonly userService: UserService,
    ) {}

    @UseInterceptors(MailerInterceptor)
    @Post('forgot-password')
    async forgotPassword(@Body() { email }: EmailDto): IMail {
        let foundedUser = await this.userService.findUser({ email })
        if (!foundedUser) throw new NotFoundException()
        let linkToResetPassword =
            await this.userProblemsService.forgotPassword(email)
        let link = QueryString.stringify(
            {
                request: linkToResetPassword,
            },
            { addQueryPrefix: true },
        )
        linkToResetPassword =
            HOST + '/api/user-problems/forgot-password/' + link
        return {
            type: TypeMails.FORGET_PASSWORD,
            to: email,
            content: {
                linkToResetPassword,
            },
        }
    }

    @ApiQuery({ schema: { $ref: '?' }, name: 'request' })
    @Redirect(HOST + '/user/reset-password')
    @Get('forgot-password')
    async redirectToResetPassword(
        @Query('request', UuidPipe) url: UUID,
        @Res() response: Response,
    ) {
        let { email, expires } =
            await this.userProblemsService.getInfoByUrl(url)
        response.cookie(
            'reset-password-for',
            { email, url },
            {
                path: '/api/user-problems/reset-password',
                secure: SECURE_COOKIES,
                httpOnly: true,
                expires,
                sameSite: 'lax',
            },
        )
    }

    @UserResources()
    @Post('delete-all-tokens')
    async deleteAllTokens({ email }: Pick<JwtPayload, 'email'>) {
        return this.userProblemsService.deleteAllTokens({ email })
    }

    @UseInterceptors(MailerInterceptor)
    @Post('reset-password')
    async resetPassword(
        @GetCookie('reset-password-for') resetPasswordFor: EmailUrlDto,
        @Body() { password: newPassword }: ChangePasswordDto,
        @Res() response: Response,
    ): IMail {
        if (!resetPasswordFor) throw new BadRequestException()
        let { email, url } = resetPasswordFor
        return this.userService
            .updateUser({ email }, { newPassword }, true)
            .then(async () => {
                await Promise.all([
                    this.deleteAllTokens({ email }),
                    this.userProblemsService.deleteTempUrl({ url }),
                ])
                response.clearCookie('reset-password-for', {
                    path: '/api/user-problems/reset-password',
                })
            })
            .then(() => ({
                to: email,
                type: TypeMails.RESET_PASSWORD,
                content: {
                    date: new Date().toLocaleString('ru-RU', {
                        dateStyle: 'full',
                        timeStyle: 'medium',
                    }),
                },
            }))
    }
}
