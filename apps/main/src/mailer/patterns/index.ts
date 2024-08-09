import {
    ContentMails,
    IContentMail,
} from '../../interfaces/content-mails.interface'
import { TypeMails } from '../type-mails.types'
import registerCodePattern from './register-code/register-code.pattern'

type GetContentMail<T extends IContentMail, V extends TypeMails> = T extends {
    type: V
}
    ? T['content']
    : never

const mailPatterns = new Map<
    TypeMails,
    (content: ContentMails['content']) => Promise<string>
>([[TypeMails.REGISTRATION_CODE, registerCodePattern]])

export function makeMail<T extends TypeMails>(
    mailType: T,
    content: GetContentMail<ContentMails, T>,
) {
    let mailPattern = mailPatterns.get(mailType)
    return mailPattern(content)
}

export const answers = new Map<
    TypeMails,
    { statusCode: number; answer: Record<string, string> }
>([
    [
        TypeMails.REGISTRATION_CODE,
        {
            statusCode: 201,
            answer: {
                message:
                    'Если почта существует - Вы получите сообщение с кодом',
            },
        },
    ],
])
