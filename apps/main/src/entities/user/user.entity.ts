import { Exclude, Expose, Transform } from 'class-transformer'
import {
    BeforeInsert,
    BeforeRemove,
    BeforeUpdate,
    Check,
    Column,
    Entity,
    Index,
    JoinColumn,
    JoinTable,
    ManyToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    RelationId,
} from 'typeorm'
import { Book } from '../books/book.entity'
import { ApiProperty } from '@nestjs/swagger'

export enum GENDER {
    MALE,
    FEMALE,
    UNKNOWN,
}

export enum ROLE {
    USER = 'USER',
    ADMIN = 'ADMIN',
}

@Check(`"birthday_date" < now()`)
@Entity('users_info')
export class UserInfo {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ type: 'date', nullable: true, name: 'birthday_date' })
    birthdayDate?: Date

    @Column({
        type: 'enum',
        enum: GENDER,
        default: GENDER.UNKNOWN,
        name: 'gender',
    })
    gender?: GENDER
}

@Index(['email'], { unique: true })
@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    @Exclude()
    id: string

    @Column({ type: 'varchar', length: 60 })
    @ApiProperty({ example: 'dsa@das.com', description: 'email' })
    email: string

    @Column({ type: 'text', name: 'password_hash' })
    @Exclude()
    password: string

    @Transform(({ value }: { value: UserInfo }) => {
        return { birthdayDate: value.birthdayDate, gender: value.gender }
    })
    @OneToOne(() => UserInfo, { eager: false, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'info_id' })
    info: UserInfo

    @Column({
        default: () => 'now()',
        name: 'created_date',
        type: 'timestamp without time zone',
    })
    createdDate: Date

    @Column({
        nullable: true,
        name: 'updated_date',
        type: 'timestamp without time zone',
    })
    updatedDate: Date

    @Exclude()
    @RelationId((user: User) => user.info, 'info_id')
    infoId: string

    @Column({
        type: 'enum',
        enum: ROLE,
        array: true,
        default: [ROLE.USER],
    })
    role: ROLE[]

    @ManyToMany(() => Book, (book) => book.bookId, {
        nullable: true,
        onUpdate: 'CASCADE',
        // eager: true,
    })
    @JoinTable({
        name: 'users_books',
        joinColumn: { name: 'user_id' },
        inverseJoinColumn: { name: 'book_id' },
    })
    books: Book[]

    @BeforeInsert()
    protected async createDate() {
        this.updatedDate = new Date()
    }

    @BeforeUpdate()
    protected async updateDate() {
        this.updatedDate = new Date()
    }

    @BeforeRemove()
    protected async removeUser() {
        console.log(`${this.id} - удалён`)
    }

    constructor(partial: Partial<User>) {
        Object.assign(this, partial)
    }
}
