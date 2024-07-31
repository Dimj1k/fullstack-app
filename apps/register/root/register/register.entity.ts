import {
    Column,
    CreateDateColumn,
    Entity,
    ObjectId,
    ObjectIdColumn,
} from 'typeorm'
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
    _id: ObjectId

    @Column()
    email: string

    @Column()
    password: string

    @Column()
    info: CacheUserInfo

    @Column()
    url: string

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date
}

export const ENTITIES = [CacheUser]
