import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToMany,
    PrimaryGeneratedColumn,
} from 'typeorm'
import { User } from '../user/user.entity'

@Entity('books')
export class Book {
    @PrimaryGeneratedColumn('uuid', { name: 'book_id' })
    bookId: string

    @Column({ type: 'varchar', length: 100, name: 'name_book', unique: true })
    nameBook: string

    @Column({ type: 'text' })
    description: string

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date

    @ManyToMany(() => User, {
        nullable: true,
        onUpdate: 'CASCADE',
        // eager: true,
    })
    users: User[]
}
