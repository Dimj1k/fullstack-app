import {
    Body,
    Controller,
    Headers,
    HttpCode,
    HttpStatus,
    Inject,
    Post,
    Req,
    Res,
    UnauthorizedException,
    UseFilters,
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
import { AuthExceptionFilter } from '../filters/auth-exception.filter'

@UseFilters(AuthExceptionFilter)
@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(@Inject() private readonly authService: AuthService) {}

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
        if (refreshToken) {
            response.json({ message: 'you logged in' })
            return
        }
        let tokens = await this.authService.login(authDto, userAgent)
        tokens.subscribe((tokens) => {
            this.setTokens(tokens, request, response)
        })
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
            response.sendStatus(200)
            return
        }
        response.clearCookie(REFRESH_TOKEN, this.tokenCookieOptions())
        request.headers.authorization = ''
        let message$ = await this.authService.deleteTokens(refreshToken)
        message$.subscribe((message) => response.json(message))
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
