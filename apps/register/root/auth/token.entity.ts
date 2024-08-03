import { UUID } from 'crypto'
import { Column, Entity, ObjectId, ObjectIdColumn } from 'typeorm'
import { ROLE } from './auth.controller'

@Entity()
export class Token {
    @ObjectIdColumn()
    _id: ObjectId

    @Column()
    token: UUID

    @Column()
    expires: Date

    @Column()
    userAgent: string

    @Column()
    userId: UUID

    @Column()
    roles: ROLE[]
}
