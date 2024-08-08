import {
    Body,
    Controller,
    Headers,
    HttpCode,
    HttpStatus,
    Post,
    Req,
    Res,
    UnauthorizedException,
    UseGuards,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthDto } from './dto/auth.dto'
import { Request, Response } from 'express'
import { REFRESH_TOKEN, SECURE_COOKIES } from '../constants'
import { Tokens } from '../interfaces/jwt-controller.interface'
import { GetCookie } from '../decorators/get-cookie.decorator'
import { lastValueFrom, take } from 'rxjs'
import { ApiTags } from '@nestjs/swagger'

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
        @Res({ passthrough: true }) response: Response,
        @Req() request: Request,
    ) {
        if (refreshToken) return { message: 'you logged in' }
        let tokens = await this.authService
            .login(authDto, userAgent)
            .catch((err) => {
                throw err ?? new UnauthorizedException({ message: 123 })
            })
        let tokens$ = tokens.pipe(take(1))
        return this.setTokens(await lastValueFrom(tokens$), request, response)
    }

    @HttpCode(HttpStatus.OK)
    @Post('refresh-tokens')
    async refreshTokens(
        @GetCookie(REFRESH_TOKEN)
        refreshToken: Tokens['refreshToken']['token'],
        @Req() request: Request,
        @Res({ passthrough: true }) response: Response,
        @Headers('user-agent') userAgent: string,
    ) {
        if (!refreshToken) throw new UnauthorizedException()
        let tokens = await this.authService
            .refreshTokens(refreshToken, userAgent)
            .catch((err) => {
                response.clearCookie(REFRESH_TOKEN, this.tokenCookieOptions())
                throw err
            })
        let tokens$ = await lastValueFrom(tokens.pipe(take(1))).catch((err) => {
            response.clearCookie(REFRESH_TOKEN, this.tokenCookieOptions())
            throw new UnauthorizedException(err)
        })
        return this.setTokens(tokens$, request, response)
    }

    @HttpCode(HttpStatus.OK)
    @Post('logout')
    async logout(
        @GetCookie(REFRESH_TOKEN)
        refreshToken: Tokens['refreshToken']['token'],
        @Req() request: Request,
        @Res({ passthrough: true }) response: Response,
    ) {
        if (!refreshToken) return
        response.clearCookie(REFRESH_TOKEN, this.tokenCookieOptions())
        request.headers.authorization = ''
        return this.authService.deleteTokens(refreshToken)
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
