import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    UnauthorizedException,
    HttpStatus,
} from '@nestjs/common'
import { Response } from 'express'
import { JsonWebTokenError } from '@nestjs/jwt'

@Catch(JsonWebTokenError, UnauthorizedException)
export class RoleExceptionFilter implements ExceptionFilter {
    catch(
        exception: UnauthorizedException | JsonWebTokenError,
        host: ArgumentsHost,
    ) {
        let ctx = host.switchToHttp()
        let response = ctx.getResponse<Response>()
        let statusCode = HttpStatus.UNAUTHORIZED
        if (exception instanceof JsonWebTokenError) {
            return response
                .sendStatus(statusCode)
                .json({ ...exception, statusCode })
        }
        response.sendStatus(statusCode).json(exception)
    }
}
