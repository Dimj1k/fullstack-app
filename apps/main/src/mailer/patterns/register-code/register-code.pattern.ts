import { RegisterCodeMail } from 'apps/main/src/interfaces/content-mails.interface'
import { loadMailPattern } from 'apps/main/src/utils/load-mail-pattern.util'
import { join } from 'path'

export default async function (content: RegisterCodeMail['content']) {
    return await loadMailPattern(
        join(
            __dirname,
            'mailer',
            'patterns',
            'register-code',
            'register-code.pattern.html',
        ),
        content,
    )
}
