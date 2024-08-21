import { ContentMails, IContentMail } from '../'
import { Chainable } from '../../shared/utils'
import { TypeMails } from '../type-mails.types'
import { forgotPasswordTemplate } from './forgot-password'
import { registerCodeTemplate } from './register-code'
import { passwordResetedTemplate } from './reseted-password'

export function makeMail<T extends TypeMails>(
    mailType: T,
    content: GetContentMail<ContentMails, T>,
) {
    let mailTemplate = mailTemplates.get(mailType)
    return mailTemplate(content)
}

const mailTemplates = new Chainable<mailTemplateFn>({})
    .add(TypeMails.REGISTRATION_CODE, registerCodeTemplate)
    .add(TypeMails.FORGET_PASSWORD, forgotPasswordTemplate)
    .add(TypeMails.RESET_PASSWORD, passwordResetedTemplate)

export const answers = new Chainable<{
    statusCode: number
    answer: Record<string, string>
}>({})
    .add(TypeMails.REGISTRATION_CODE, {
        statusCode: 201,
        answer: {
            message: 'Если почта существует - Вы получите сообщение с кодом',
        },
    })
    .add(TypeMails.FORGET_PASSWORD, {
        statusCode: 201,
        answer: {
            message: 'Ссылка на сброс пароля отправлена вам на почту',
        },
    })
    .add(TypeMails.RESET_PASSWORD, {
        statusCode: 201,
        answer: {
            message: 'Ваш пароль был сброшен',
        },
    })

export type GetContentMail<
    T extends IContentMail,
    V extends TypeMails,
> = T extends {
    type: V
}
    ? T['content']
    : never

type mailTemplateFn = (content: ContentMails['content']) => Promise<string>

type Equal<X, Y> =
    (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2
        ? true
        : false

type Expect<T extends true> = T

type mailTemplateEqualAnswers = Expect<
    Equal<
        keyof (typeof answers)['chain'],
        keyof (typeof mailTemplates)['chain']
    >
>
