import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    ObjectId,
    ObjectIdColumn,
    Unique,
    VersionColumn,
} from 'typeorm'

@Unique(['action', 'email'])
@Entity()
export class TempUrl {
    @ObjectIdColumn()
    _id: ObjectId

    @Column()
    action: string

    @Index({ expireAfterSeconds: 7200 })
    @CreateDateColumn()
    createdAt: Date = new Date()

    @Column()
    email: string

    @Column()
    url: string

    @VersionColumn()
    _v: number
}
