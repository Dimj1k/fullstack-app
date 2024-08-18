import { join } from 'path'
import { PasswordResetedMail } from '../../../shared/interfaces'
import { loadMailTemplate } from '../../../shared/utils'

export async function passwordResetedTemplate(
    content: PasswordResetedMail['content'],
) {
    return loadMailTemplate(
        join(__dirname, 'mailer', 'templates', 'reseted-password'),
        content,
    )
}
