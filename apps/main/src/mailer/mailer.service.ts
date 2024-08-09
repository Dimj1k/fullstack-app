import { MailerService } from '@nestjs-modules/mailer'
import { Injectable } from '@nestjs/common'
import { makeMail } from './patterns'
import { ContentMails } from '../interfaces/content-mails.interface'

export interface IMailHeader {
    to: string
    from?: string
}

export type IMail = IMailHeader & ContentMails

@Injectable()
export class Mailer {
    private from: string = 'dh7fm391j@yandex.ru'
    constructor(private readonly mailerService: MailerService) {}

    async sendMail(header: IMailHeader, content: ContentMails) {
        this.mailerService.sendMail({
            to: header.to,
            from: header?.from ?? this.from,
            html: await makeMail(content.type, content.content),
        })
    }
}
