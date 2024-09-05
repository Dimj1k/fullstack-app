import { MailerService } from '@nestjs-modules/mailer'
import { Injectable } from '@nestjs/common'
import { answers, ContentMails } from '../../src/mailer'

export interface IMailHeader {
    to: string[] | string
    from?: string
}

export type IMail = Promise<IMailHeader & ContentMails>

@Injectable()
export class MockMailer {
    constructor(private readonly mailerService: MailerService) {}

    async sendMail(header: IMailHeader, { type, content }: ContentMails) {
        return answers[type]
    }
}
