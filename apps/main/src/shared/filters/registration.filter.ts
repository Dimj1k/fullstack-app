import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    RequestTimeoutException,
    ConflictException,
    NotFoundException,
} from '@nestjs/common'
import { Request, Response } from 'express'

@Catch(RequestTimeoutException, ConflictException, NotFoundException)
export class RegistrationExceptionFilter implements ExceptionFilter {
    catch(
        exception: RequestTimeoutException | ConflictException,
        host: ArgumentsHost,
    ) {
        const ctx = host.switchToHttp()
        const response = ctx.getResponse<Response>()
        const request = ctx.getRequest<Request>()
        let status = exception.getStatus()
        let res = exception.getResponse()
        response.status(status).json(res)
    }
}
