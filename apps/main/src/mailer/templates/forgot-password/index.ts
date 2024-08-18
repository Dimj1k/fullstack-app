import { join } from 'path'
import { ForgotPasswordMail } from '../../../shared/interfaces'
import { loadMailTemplate } from '../../../shared/utils'

export async function forgotPasswordTemplate(
    content: ForgotPasswordMail['content'],
) {
    return loadMailTemplate(
        join(__dirname, 'mailer', 'templates', 'forgot-password'),
        content,
    )
}
