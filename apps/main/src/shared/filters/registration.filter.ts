import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    RequestTimeoutException,
    ConflictException,
    NotFoundException,
    HttpException,
} from '@nestjs/common'
import { Request, Response } from 'express'

@Catch(HttpException)
export class RegistrationExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp()
        const response = ctx.getResponse<Response>()
        const request = ctx.getRequest<Request>()
        let status = exception.getStatus()
        let res = exception.getResponse()
        response.status(status).json(res)
    }
}
