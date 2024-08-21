import { MailerService } from '@nestjs-modules/mailer'
import { Injectable } from '@nestjs/common'
import { answers, makeMail } from './templates'
import { ContentMails } from './content-mails.interface'

export interface IMailHeader {
    to: string[] | string
    from?: string
}

export type IMail = Promise<IMailHeader & ContentMails>

@Injectable()
export class Mailer {
    private from: string = 'dh7fm391j@yandex.ru'
    constructor(private readonly mailerService: MailerService) {}

    async sendMail(header: IMailHeader, { type, content }: ContentMails) {
        return this.mailerService
            .sendMail({
                to: header.to,
                from: header?.from ?? this.from,
                encoding: 'utf-8',
                html: await makeMail(type, content),
            })
            .then((sentInfo) => {
                return ['2', '3'].includes(
                    sentInfo.response.split(' ', 1)[0][0],
                )
                    ? answers.get(type)
                    : {
                          statusCode: 400,
                          answer: { message: 'Письмо не было отправлено' },
                      }
            })
    }
}
