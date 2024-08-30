import { MailerService } from '@nestjs-modules/mailer'
import { Inject, Injectable } from '@nestjs/common'
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
                to: lowerCase(header.to),
                from: lowerCase(header?.from ?? this.from),
                encoding: 'utf-8',
                html: await makeMail(type, content),
            })
            .then((sentInfo) => {
                return ['2', '3'].includes(
                    sentInfo.response.split(' ', 1)[0][0],
                )
                    ? answers[type]
                    : {
                          statusCode: 400,
                          answer: { message: 'Письмо не было отправлено' },
                      }
            })
    }
}

function lowerCase(str: string): string
function lowerCase(arrayStr: string[]): string[]
function lowerCase(str: string | string[]): string | string[]
function lowerCase(str: string | string[]) {
    if (Array.isArray(str)) return str.map((v) => v.toLowerCase())
    return str.toLowerCase()
}
