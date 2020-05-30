import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  public eventId: number;
  @Column()
  public bannerImage: string;
  @Column()
  public mainImage: string;
}
