import {
    BadRequestException,
    CallHandler,
    ExecutionContext,
    Inject,
    Injectable,
    NestInterceptor,
} from '@nestjs/common'
import { catchError, map, Observable, throwError } from 'rxjs'
import { Mailer, IMail } from '../mailer'
import { Response } from 'express'
import { answers } from '../mailer/patterns'
import { ContentMails } from '../interfaces'

@Injectable()
export class MailerInterceptor implements NestInterceptor {
    constructor(@Inject('Mailer') private readonly mailer: Mailer) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            map(({ content, type, ...header }: IMail) => {
                let response = context.switchToHttp().getResponse<Response>()
                let { statusCode, answer } = answers.get(type)
                response.status(statusCode).json(answer)
                this.mailer.sendMail(
                    {
                        to: header.to,
                        from: header?.from,
                    },
                    { content, type } as ContentMails,
                )
            }),
            catchError((err) => throwError(() => err)),
        )
    }
}
