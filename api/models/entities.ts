import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity()
export class Logs {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ unique: true })
    crunchyrollID: string

    @Column()
    createdAt: Date
}