import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    UnauthorizedException,
    RequestTimeoutException,
    NotFoundException,
    HttpException,
    HttpStatus,
} from '@nestjs/common'
import { Response } from 'express'
import { REFRESH_TOKEN, SECURE_COOKIES } from '../constants'
import { RpcException } from '@nestjs/microservices'

@Catch(HttpException, RpcException)
export class AuthExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException | RpcException, host: ArgumentsHost) {
        let ctx = host.switchToHttp()
        let response = ctx.getResponse<Response>()
        if (exception instanceof HttpException) {
            response.clearCookie(REFRESH_TOKEN, this.tokenCookieOptions())
            return response
                .status(exception.getStatus())
                .json(exception.getResponse())
        }
        const statuses = {
            '2': HttpStatus.UNAUTHORIZED,
            '14': HttpStatus.SERVICE_UNAVAILABLE,
        }
        let error = exception.getError()
        let status: HttpStatus =
            typeof error == 'object'
                ? (statuses[error['code'] || error['error']['code']] ??
                  HttpStatus.I_AM_A_TEAPOT)
                : statuses[error]
        if (status === HttpStatus.UNAUTHORIZED)
            response.clearCookie(REFRESH_TOKEN, this.tokenCookieOptions())
        response.status(status).json(error['error'])
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
