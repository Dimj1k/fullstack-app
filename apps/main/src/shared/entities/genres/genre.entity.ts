import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm'

@Entity('genres', { synchronize: false })
export class Genre {
    @PrimaryGeneratedColumn('increment')
    id: number

    @Column({ type: 'varchar', length: 63 })
    genre: string
}
