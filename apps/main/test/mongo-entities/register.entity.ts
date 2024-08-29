import { Exclude } from 'class-transformer'
import { Column, Entity, Index, ObjectId, ObjectIdColumn } from 'typeorm'
enum GENDER {
    MALE,
    FEMALE,
    UNKNOWN,
}

export class CacheUserInfo {
    @Column({ name: 'birthday_date' })
    birthdayDate?: Date

    @Column({
        type: 'enum',
        enum: GENDER,
        default: GENDER.UNKNOWN,
        name: 'gender',
    })
    gender?: GENDER
}

@Entity()
export class CacheUser {
    @ObjectIdColumn()
    @Exclude()
    _id: ObjectId

    @Column()
    email: string

    @Column()
    password: string

    @Column()
    info: CacheUserInfo

    @Column()
    @Exclude()
    code: string

    @Index({ expireAfterSeconds: 900 })
    @Column()
    @Exclude()
    createdAt: Date = new Date()

    constructor(partial?: Partial<CacheUser>) {
        Object.assign(this, partial)
    }
}

export const ENTITIES = [CacheUser]
