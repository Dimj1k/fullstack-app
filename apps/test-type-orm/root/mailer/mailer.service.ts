import { Injectable, Logger } from '@nestjs/common'
import { MailerService } from '@nestjs-modules/mailer'

class MailException extends Error {
    constructor(message: string) {
        super(message)
    }
}

@Injectable()
export class MyMailerService {
    private from: string = 'dh7fm391j@yandex.ru'
    private logger = new Logger(MailerService.name)
    constructor(private readonly mailService: MailerService) {}

    async sendMail(to: string, subject?: string, text?: string, html?: string) {
        return (
            this.mailService
                .sendMail({
                    from: this.from,
                    to,
                    subject,
                    text,
                    html,
                })
                // .then((res) => this.logger.log(res))
                .catch((err) => {
                    throw new MailException(err)
                })
        )
    }
}
