import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm"

@Entity()
export class Logs {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    crunchyrollID: string

    @Column()
    createdAt: Date
}