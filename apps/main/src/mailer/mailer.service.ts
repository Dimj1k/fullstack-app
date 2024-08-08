import { Injectable, NotFoundException } from '@nestjs/common'
import { MailerService } from '@nestjs-modules/mailer'

@Injectable()
export class MyMailerService {
    private from: string = 'dh7fm391j@yandex.ru'
    constructor(private readonly mailService: MailerService) {}

    async sendMail(
        to: string,
        subject?: string,
        text?: string,
        html?: string,
        send: boolean = false,
    ) {
        if (send)
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
                        throw new NotFoundException()
                    })
            )
    }
}
