import { join } from 'path'
import { RegisterCodeMail } from '../../../interfaces'
import { loadMailPattern } from '../../../utils'

export async function registerCodePattern(
    content: RegisterCodeMail['content'],
) {
    if (!__dirname.includes('mailer'))
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
    return await loadMailPattern(
        join(__dirname, 'register-code.pattern.html'),
        content,
    )
}
