import { TypeMails } from '../mailer/type-mails.types'

export interface IContentMail {
    type: TypeMails
    content: Record<string, string>
}

export interface RegisterCodeMail extends IContentMail {
    type: TypeMails.REGISTRATION_CODE
    content: {
        code: string
    }
}

export type ContentMails = RegisterCodeMail
