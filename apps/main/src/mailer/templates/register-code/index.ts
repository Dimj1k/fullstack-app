import { join } from 'path'
import { RegisterCodeMail } from '../../'
import { loadMailTemplate } from '../../utils'

export async function registerCodeTemplate(
    content: RegisterCodeMail['content'],
) {
    return loadMailTemplate(
        join(__dirname, 'mailer', 'templates', 'register-code'),
        content,
    )
}
