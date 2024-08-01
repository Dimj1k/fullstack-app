import { hash } from 'bcrypt'
import { subDays } from 'date-fns'
import {
    BeforeInsert,
    BeforeRemove,
    BeforeUpdate,
    Check,
    Column,
    Entity,
    Index,
    JoinColumn,
    OneToOne,
    PrimaryGeneratedColumn,
    RelationId,
    VirtualColumn,
} from 'typeorm'

export enum GENDER {
    MALE,
    FEMALE,
    UNKNOWN,
}

@Entity('users_info')
@Check(`"birthday_date" < now()`)
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

@Entity('users')
@Index(['email'], { unique: true })
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ type: 'varchar' })
    email: string

    @Column({ type: 'text', name: 'password_hash' })
    password: string

    @OneToOne(() => UserInfo, { eager: false, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'info_id' })
    info: UserInfo

    @Column({
        nullable: true,
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

    @RelationId((user: User) => user.info, 'info_id')
    infoId: string

    @BeforeInsert()
    protected async createDate() {
        this.createdDate = this.updatedDate = subDays(new Date(), 4)
        this.password = await hash(this.password, 5)
    }

    @BeforeUpdate()
    protected async updateDate() {
        this.updatedDate = new Date()
        this.password = await hash(this.password, 5)
    }

    @BeforeRemove()
    protected async removeUser() {
        console.log(`${this.id} - удалён`)
    }
}
