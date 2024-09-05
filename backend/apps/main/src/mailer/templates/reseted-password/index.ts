import { join } from 'path'
import { PasswordResetedMail } from '../../'
import { loadMailTemplate } from '../../utils'

export async function passwordResetedTemplate(
    content: PasswordResetedMail['content'],
) {
    return loadMailTemplate(
        join(__dirname, 'mailer', 'templates', 'reseted-password'),
        content,
    )
}
