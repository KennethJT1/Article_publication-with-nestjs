import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({name: "tags"}) // this is the name it will be called in db
export class TagEntity{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;
}