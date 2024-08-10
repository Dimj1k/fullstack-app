import { ContentMails, IContentMail } from '../../interfaces'
import { Chainable } from '../../utils'
import { TypeMails } from '../type-mails.types'
import { registerCodePattern } from './register-code'

export function makeMail<T extends TypeMails>(
    mailType: T,
    content: GetContentMail<ContentMails, T>,
) {
    let mailPattern = mailPatterns.get(mailType)
    return mailPattern(content)
}

const mailPatterns = new Chainable<mailPatternFn, {}>({}).add(
    TypeMails.REGISTRATION_CODE,
    registerCodePattern,
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

type mailPatternFn = (content: ContentMails['content']) => Promise<string>

type Equal<X, Y> =
    (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2
        ? true
        : false

type Expect<T extends true> = T

type mailPatternEqualAnswers = Expect<
    Equal<keyof (typeof answers)['chain'], keyof (typeof mailPatterns)['chain']>
>
