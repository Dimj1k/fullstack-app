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
        if (typeof error == 'object') {
            let statusCode = statuses[error['code'] ?? HttpStatus.I_AM_A_TEAPOT]
            return response.status(statusCode).json({
                statusCode,
                message: error['details'],
                error:
                    statusCode == HttpStatus.BAD_REQUEST
                        ? 'BAD REQUEST'
                        : 'SERVICE_UNAVAILABLE',
            })
        }
        return response.status(statuses[error])
    }
}
