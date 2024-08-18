import { join } from 'path'
import { RegisterCodeMail } from '../../../shared/interfaces'
import { loadMailTemplate } from '../../../shared/utils'

export async function registerCodeTemplate(
    content: RegisterCodeMail['content'],
) {
    return loadMailTemplate(
        join(__dirname, 'mailer', 'templates', 'register-code'),
        content,
    )
}
