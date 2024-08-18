import { TypeMails } from '../../mailer'

export interface IContentMail {
    type: TypeMails
    content: Record<string, any>
}

export interface RegisterCodeMail extends IContentMail {
    type: TypeMails.REGISTRATION_CODE
    content: {
        code: string
    }
}

export interface ForgotPasswordMail extends IContentMail {
    type: TypeMails.FORGET_PASSWORD
    content: {
        linkToResetPassword: string
    }
}

export interface PasswordResetedMail extends IContentMail {
    type: TypeMails.RESET_PASSWORD
    content: {
        date: string
    }
}

export type ContentMails =
    | RegisterCodeMail
    | ForgotPasswordMail
    | PasswordResetedMail
