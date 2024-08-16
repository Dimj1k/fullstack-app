import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpStatus,
    UnauthorizedException,
} from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'
import { Request, Response } from 'express'

const statuses = {
    '2': HttpStatus.BAD_REQUEST,
    '14': HttpStatus.SERVICE_UNAVAILABLE,
}

@Catch(RpcException)
export class RpcExceptionFilter implements ExceptionFilter {
    catch(exception: RpcException, host: ArgumentsHost) {
        const ctx = host.switchToHttp()
        const response = ctx.getResponse<Response>()
        const request = ctx.getRequest<Request>()
        let error = exception.getError()
        let status: HttpStatus =
            typeof error == 'object'
                ? (statuses[error['code'] || error['error']['code']] ??
                  HttpStatus.I_AM_A_TEAPOT)
                : statuses[error]
        response.status(status).json()
    }
}
