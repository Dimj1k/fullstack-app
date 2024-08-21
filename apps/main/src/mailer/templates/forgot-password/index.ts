import { join } from 'path'
import { ForgotPasswordMail } from '../../'
import { loadMailTemplate } from '../../utils'

export async function forgotPasswordTemplate(
    content: ForgotPasswordMail['content'],
) {
    return loadMailTemplate(
        join(__dirname, 'mailer', 'templates', 'forgot-password'),
        content,
    )
}
