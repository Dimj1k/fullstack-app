import { join } from 'path'
import { RegisterCodeMail } from '../../../shared/interfaces'
import { loadMailtemplate } from '../../../shared/utils'

export async function registerCodetemplate(
    content: RegisterCodeMail['content'],
) {
    return loadMailtemplate(
        join(__dirname, 'mailer', 'templates', 'register-code'),
        content,
    )
}
