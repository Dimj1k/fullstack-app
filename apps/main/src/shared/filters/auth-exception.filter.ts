import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    UnauthorizedException,
    RequestTimeoutException,
    NotFoundException,
} from '@nestjs/common'
import { Response } from 'express'
import { REFRESH_TOKEN, SECURE_COOKIES } from '../constants'

@Catch(UnauthorizedException, RequestTimeoutException, NotFoundException)
export class AuthExceptionFilter implements ExceptionFilter {
    catch(
        exception: UnauthorizedException | RequestTimeoutException,
        host: ArgumentsHost,
    ) {
        let ctx = host.switchToHttp()
        let response = ctx.getResponse<Response>()
        response.clearCookie(REFRESH_TOKEN, this.tokenCookieOptions())
        return response
            .status(exception.getStatus())
            .json(exception.getResponse())
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
