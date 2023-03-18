import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'follows' })
export class FollowEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  followerId: number;

  @Column()
  followingId: number;
}