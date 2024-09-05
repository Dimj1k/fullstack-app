import { UUID } from 'crypto'
import { Column, Entity, Index, ObjectId, ObjectIdColumn } from 'typeorm'
import { ROLE } from './interfaces'

@Entity()
export class Token {
    @ObjectIdColumn()
    _id: ObjectId

    @Column()
    token: UUID

    @Index({ expireAfterSeconds: 0 })
    @Column()
    expires: Date

    @Column()
    email: string

    @Column()
    userAgent: string

    @Column()
    userId: UUID

    @Column()
    roles: ROLE[]
}
