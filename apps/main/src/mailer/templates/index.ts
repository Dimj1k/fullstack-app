import { ContentMails, IContentMail } from '../../shared/interfaces'
import { Chainable } from '../../shared/utils'
import { TypeMails } from '../type-mails.types'
import { registerCodetemplate } from './register-code'

export function makeMail<T extends TypeMails>(
    mailType: T,
    content: GetContentMail<ContentMails, T>,
) {
    let mailtemplate = mailtemplates.get(mailType)
    return mailtemplate(content)
}

const mailtemplates = new Chainable<mailtemplateFn>({}).add(
    TypeMails.REGISTRATION_CODE,
    registerCodetemplate,
)

export const answers = new Chainable<{
    statusCode: number
    answer: Record<string, string>
}>({}).add(TypeMails.REGISTRATION_CODE, {
    statusCode: 201,
    answer: {
        message: 'Если почта существует - Вы получите сообщение с кодом',
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

type mailtemplateFn = (content: ContentMails['content']) => Promise<string>

type Equal<X, Y> =
    (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2
        ? true
        : false

type Expect<T extends true> = T

type mailtemplateEqualAnswers = Expect<
    Equal<
        keyof (typeof answers)['chain'],
        keyof (typeof mailtemplates)['chain']
    >
>
