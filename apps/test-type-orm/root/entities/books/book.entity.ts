import {
    Column,
    Entity,
    JoinTable,
    ManyToMany,
    PrimaryGeneratedColumn,
    VirtualColumn,
} from 'typeorm'
import { UUID } from 'typeorm/driver/mongodb/bson.typings'
import { User } from '../user/user.entity'

@Entity('books')
export class Book {
    @PrimaryGeneratedColumn('uuid')
    bookId: UUID

    @Column({ type: 'varchar', length: 100, name: 'name_book' })
    nameBook: string

    @Column({ type: 'text' })
    description: string

    @VirtualColumn({
        query: (alias) =>
            `SELECT COUNT(*) FROM users WHERE "bookId" = ${alias}.bookId`,
    })
    numberUsers: number

    @ManyToMany(() => User, { nullable: true })
    @JoinTable()
    users: User[]
}
