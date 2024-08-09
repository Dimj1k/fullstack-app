import {
    CallHandler,
    ExecutionContext,
    Inject,
    Injectable,
    NestInterceptor,
} from '@nestjs/common'
import { map, Observable } from 'rxjs'
import { Mailer, IMail } from '../mailer/mailer.service'
import { Response } from 'express'
import { answers } from '../mailer/patterns'

@Injectable()
export class MailerInterceptor implements NestInterceptor {
    constructor(@Inject('Mailer') private readonly mailer: Mailer) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            map((headerAndContent: IMail) => {
                let response = context.switchToHttp().getResponse<Response>()
                let answer = answers.get(headerAndContent.type)
                response.status(answer.statusCode).json(answer.answer)
                this.mailer.sendMail(
                    {
                        to: headerAndContent.to,
                        from: headerAndContent?.from,
                    },
                    'from' in headerAndContent
                        ? (({ from, ...content }) => content)(headerAndContent)
                        : headerAndContent,
                )
            }),
        )
    }
}
