import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToMany,
    PrimaryGeneratedColumn,
} from 'typeorm'
import { User } from '../user'

@Entity('books')
export class Book {
    @PrimaryGeneratedColumn('uuid', { name: 'book_id' })
    bookId: string

    @Column({
        type: 'hstore',
        nullable: true,
    })
    images: { small: string; big: string; default: string }

    @Column({ type: 'varchar', length: 63, name: 'name_book', unique: true })
    nameBook: string

    @Column({ type: 'text' })
    description: string

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date

    @Column({ type: 'bigint', default: 0 })
    likes: number

    @ManyToMany(() => User, {
        nullable: true,
        onUpdate: 'CASCADE',
        // eager: true,
    })
    users: User[]
}
