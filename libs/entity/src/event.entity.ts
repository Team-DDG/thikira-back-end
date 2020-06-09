import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  public e_id: number;
  @Column()
  public banner_image: string;
  @Column()
  public main_image: string;
}
