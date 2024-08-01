import { Exclude, Transform } from 'class-transformer'
import { GENDER, User } from '../entities/user/user.entity'

export class UserInfo {
    @Exclude()
    id: string

    birthdayDate?: Date

    gender?: GENDER
}

export class UserInterceptor {
    @Exclude()
    id: string
    email: string

    @Exclude()
    password: string

    @Transform(({ value }) => {
        return { birthdayDate: value.birthdayDate, gender: value.gender }
    })
    info: UserInfo

    constructor(partial: Partial<User>) {
        Object.assign(this, partial)
    }
}
