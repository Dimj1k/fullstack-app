import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    UnauthorizedException,
} from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'
import { Response } from 'express'
import { REFRESH_TOKEN, SECURE_COOKIES } from '../constants'

@Catch(UnauthorizedException)
export class AuthExceptionFilter implements ExceptionFilter {
    catch(
        exception: UnauthorizedException | RpcException,
        host: ArgumentsHost,
    ) {
        let ctx = host.switchToHttp()
        let response = ctx.getResponse<Response>()
        if (exception instanceof UnauthorizedException) {
            response.clearCookie(REFRESH_TOKEN, this.tokenCookieOptions())
            let status = exception.getStatus()
            return response.status(status).json(exception.getResponse())
        }
        return response.status(401).json(exception.getError())
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
