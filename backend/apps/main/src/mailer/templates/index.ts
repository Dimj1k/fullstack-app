import { HttpStatus } from '@nestjs/common'
import { ContentMails, IContentMail } from '../'
import { TypeMails } from '../type-mails.types'
import { forgotPasswordTemplate } from './forgot-password'
import { registerCodeTemplate } from './register-code'
import { passwordResetedTemplate } from './reseted-password'

export function makeMail<T extends TypeMails>(
    mailType: T,
    content: GetContentMail<ContentMails, T>,
) {
    let mailTemplate = mailTemplates[mailType]
    return mailTemplate(content)
}

export const mailTemplates: Record<TypeMails, mailTemplateFn> = {
    [TypeMails.REGISTRATION_CODE]: registerCodeTemplate,
    [TypeMails.FORGET_PASSWORD]: forgotPasswordTemplate,
    [TypeMails.RESET_PASSWORD]: passwordResetedTemplate,
}

export const answers: Record<
    TypeMails,
    { statusCode: HttpStatus; answer: Record<string | symbol | number, string> }
> = {
    [TypeMails.REGISTRATION_CODE]: {
        statusCode: 201,
        answer: {
            message: 'Если почта существует - Вы получите сообщение с кодом',
        },
    },
    [TypeMails.FORGET_PASSWORD]: {
        statusCode: 201,
        answer: {
            message: 'Ссылка на сброс пароля отправлена вам на почту',
        },
    },
    [TypeMails.RESET_PASSWORD]: {
        statusCode: 200,
        answer: {
            message: 'Ваш пароль был сброшен',
        },
    },
}

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
    Equal<keyof typeof answers, keyof typeof mailTemplates>
>
