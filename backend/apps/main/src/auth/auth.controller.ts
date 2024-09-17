import {
    BadRequestException,
    Body,
    Controller,
    Headers,
    HttpCode,
    HttpStatus,
    Post,
    Req,
    Res,
    UnauthorizedException,
    UseFilters,
    UseInterceptors,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthDto } from './dto'
import { Request, Response } from 'express'
import { REFRESH_TOKEN, SECURE_COOKIES } from '../shared/constants'
import { Tokens } from '../shared/interfaces'
import { GetCookie } from '../shared/decorators'
import { ApiTags } from '@nestjs/swagger'
import { AuthExceptionFilter } from '../shared/filters'
import { RpcExceptionFilter } from '../shared/filters'

@UseFilters(AuthExceptionFilter)
@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(
        @Body() authDto: AuthDto,
        @Headers('user-agent') userAgent: string,
        @GetCookie(REFRESH_TOKEN)
        refreshToken: Tokens['refreshToken']['token'],
        @Res() response: Response,
        @Req() request: Request,
    ) {
        if (refreshToken) throw new BadRequestException('Вы уже вошли')
        let tokens = await this.authService.login(authDto, userAgent)
        // tokens.subscribe((tokens) => {
        //     this.setTokens(tokens, request, response)
        // })
        this.setTokens(tokens, request, response)
    }

    @HttpCode(HttpStatus.OK)
    @Post('refresh-tokens')
    async refreshTokens(
        @GetCookie(REFRESH_TOKEN)
        refreshToken: Tokens['refreshToken']['token'],
        @Req() request: Request,
        @Res() response: Response,
        @Headers('user-agent') userAgent: string,
    ) {
        if (!refreshToken) throw new UnauthorizedException()
        let tokens = await this.authService.refreshTokens(
            refreshToken,
            userAgent,
        )
        // tokens.subscribe((tokens) => this.setTokens(tokens, request, response))
        this.setTokens(tokens, request, response)
    }

    @HttpCode(HttpStatus.OK)
    @Post('logout')
    async logout(
        @GetCookie(REFRESH_TOKEN)
        refreshToken: Tokens['refreshToken']['token'],
        @Req() request: Request,
        @Res() response: Response,
    ) {
        if (!refreshToken) {
            return response.sendStatus(200)
        }
        response.clearCookie(REFRESH_TOKEN, this.tokenCookieOptions())
        request.headers.authorization = ''
        let message = await this.authService.deleteTokens(refreshToken)
        response.json(message)
        // message.subscribe((message) => response.json(message))
    }

    private setTokens(
        { accessToken, refreshToken }: Tokens,
        req: Request,
        res: Response,
    ) {
        res.cookie(
            REFRESH_TOKEN,
            refreshToken.token,
            this.tokenCookieOptions(new Date(refreshToken.expires)),
        )
        req.headers.authorization = `Bearer ${accessToken}`
        res.json({
            accessToken: `Bearer ${accessToken}`,
        })
    }

    private tokenCookieOptions(expires: Date = new Date()) {
        return {
            httpOnly: true,
            sameSite: 'lax' as 'lax' | 'strict' | 'none',
            expires,
            secure: SECURE_COOKIES,
            path: '/api/auth',
        }
    }
}
