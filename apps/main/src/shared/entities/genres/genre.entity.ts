import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm'

@Entity('genres')
export class Genre {
    @PrimaryGeneratedColumn('rowid')
    id: number

    @Index({ unique: true })
    @Column({ type: 'varchar', length: 63 })
    genre: string
}
