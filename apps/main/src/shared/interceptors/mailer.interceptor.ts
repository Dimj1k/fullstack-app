import {
    BadRequestException,
    CallHandler,
    ExecutionContext,
    Inject,
    Injectable,
    NestInterceptor,
} from '@nestjs/common'
import { map, Observable } from 'rxjs'
import { Mailer, IMail, ContentMails } from '../../mailer'
import { Response } from 'express'

@Injectable()
export class MailerInterceptor implements NestInterceptor {
    constructor(@Inject('Mailer') private readonly mailer: Mailer) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            map(async ({ content, type, ...header }: Awaited<IMail>) => {
                let response = context.switchToHttp().getResponse<Response>()
                await this.mailer
                    .sendMail(
                        {
                            to: header.to,
                            from: header?.from,
                        },
                        { content, type } as ContentMails,
                    )
                    .then(({ statusCode, answer }) =>
                        response.status(statusCode).json(answer),
                    )
                    .catch((err) =>
                        response
                            .status(400)
                            .json({ message: 'Письмо не было отправлено' }),
                    )
            }),
        )
    }
}
