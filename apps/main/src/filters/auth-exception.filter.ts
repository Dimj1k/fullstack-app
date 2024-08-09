import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    UnauthorizedException,
} from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'
import { Response } from 'express'
import { REFRESH_TOKEN, SECURE_COOKIES } from '../constants'
import { throwError } from 'rxjs'

@Catch(UnauthorizedException, RpcException)
export class AuthExceptionFilter implements ExceptionFilter {
    catch(
        exception: UnauthorizedException | RpcException,
        host: ArgumentsHost,
    ) {
        let ctx = host.switchToHttp()
        let response = ctx.getResponse<Response>()
        response.clearCookie(REFRESH_TOKEN, this.tokenCookieOptions())
        if (exception instanceof UnauthorizedException) {
            let status = exception.getStatus()
            // return throwError(() => exception.getResponse()).subscribe(
            //     (err) => {
            //         response.status(status).json(err)
            //     },
            // )
            return response.status(status).json(exception.getResponse())
        }
        // console.log('tir', exception)
        // return throwError(() => exception.getError()).subscribe((err) => {
        //     response.status(401).json(err)
        // })
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
