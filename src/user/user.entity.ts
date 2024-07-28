import { Exclude, Transform } from 'class-transformer'
import { GENDER } from '~entities/pg/user.entity'

export class UserInfo {
    @Exclude()
    id: string

    birthdayDate?: Date

    gender?: GENDER
}

export class UserEntity {
    @Exclude()
    id: string
    username: string
    name: string

    @Exclude()
    password: string

    @Transform(({ value }) => {
        return { birthdayDate: value.birthdayDate, gender: value.gender }
    })
    info: UserInfo

    constructor(partial: Partial<UserEntity>) {
        Object.assign(this, partial)
    }
}
